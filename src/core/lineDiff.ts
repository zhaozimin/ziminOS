/**
 * [INPUT]: 无依赖（纯函数）
 * [OUTPUT]: 对外提供 diffLineHunks（两段文本的逐行差异块）、hunksToOffsetChanges（差异块转字符区间替换），
 *           以及 LineHunk / OffsetChange 两个类型
 * [POS]: core 的文本差异层。markdownViewState 用它把一次后台改写拆成若干处精确替换交给编辑器，
 *        而不是让 Obsidian 从磁盘回推时把「第一处改动到最后一处改动」整段替换——
 *        整段替换会销毁其间所有图片与嵌入的已测高度，版面塌缩后滚动恢复追不上
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

// ============================================================
// 契约
// ============================================================

/** 旧文本第 [fromA, toA) 行被替换为新文本第 [fromB, toB) 行 */
export interface LineHunk {
    readonly fromA: number;
    readonly toA: number;
    readonly fromB: number;
    readonly toB: number;
}

/** 旧文本字符区间 [from, to) 替换为 text；同一批的区间都以旧文本为坐标、互不重叠、升序 */
export interface OffsetChange {
    readonly from: number;
    readonly to: number;
    readonly text: string;
}

/**
 * Myers 编辑距离的上限。排版的改动通常只有几处；超过这个数说明几乎整篇都变了，
 * 精确拆分不再有意义，退回一整块替换，算法开销也就封顶在 O(D²)。
 */
const MAX_EDIT_DISTANCE = 400;

// ============================================================
// 逐行差异
// ============================================================

/** 两段按 '\n' 切开的行数组之间的差异块；相等时返回空数组 */
export function diffLineHunks(a: readonly string[], b: readonly string[]): LineHunk[] {
    let prefix = 0;

    while (prefix < a.length && prefix < b.length && a[prefix] === b[prefix]) prefix += 1;

    let suffix = 0;

    while (
        suffix < a.length - prefix
        && suffix < b.length - prefix
        && a[a.length - 1 - suffix] === b[b.length - 1 - suffix]
    ) suffix += 1;

    const n = a.length - prefix - suffix;
    const m = b.length - prefix - suffix;

    if (n === 0 && m === 0) return [];

    const whole: LineHunk = { fromA: prefix, toA: prefix + n, fromB: prefix, toB: prefix + m };

    if (n === 0 || m === 0) return [whole];

    const matches = myersMatches(
        (x) => a[prefix + x],
        (y) => b[prefix + y],
        n,
        m,
    );

    if (!matches) return [whole];

    const hunks: LineHunk[] = [];
    let x0 = 0;
    let y0 = 0;

    for (const [x, y] of matches) {
        if (x > x0 || y > y0) {
            hunks.push({ fromA: prefix + x0, toA: prefix + x, fromB: prefix + y0, toB: prefix + y });
        }

        x0 = x + 1;
        y0 = y + 1;
    }

    if (x0 < n || y0 < m) {
        hunks.push({ fromA: prefix + x0, toA: prefix + n, fromB: prefix + y0, toB: prefix + m });
    }

    return hunks;
}

/**
 * Myers O(ND) 差异：返回按升序排列的相等行对 (x, y)。
 * 编辑距离超过上限时返回 null，由调用方退回整块替换。
 */
function myersMatches(
    lineA: (index: number) => string,
    lineB: (index: number) => string,
    n: number,
    m: number,
): [number, number][] | null {
    const max = Math.min(n + m, MAX_EDIT_DISTANCE);
    const offset = max + 1;
    const v = new Int32Array(2 * max + 3);
    /** trace[d] 是第 d 步开始前的 v，只存 k ∈ [-d, d] 那一段 */
    const trace: Int32Array[] = [];
    let found = -1;

    for (let d = 0; d <= max && found < 0; d += 1) {
        trace.push(v.slice(offset - d, offset + d + 1));

        for (let k = -d; k <= d; k += 2) {
            let x = k === -d || (k !== d && v[offset + k - 1] < v[offset + k + 1])
                ? v[offset + k + 1]
                : v[offset + k - 1] + 1;
            let y = x - k;

            while (x < n && y < m && lineA(x) === lineB(y)) {
                x += 1;
                y += 1;
            }

            v[offset + k] = x;

            if (x >= n && y >= m) {
                found = d;
                break;
            }
        }
    }

    if (found < 0) return null;

    const matches: [number, number][] = [];
    let x = n;
    let y = m;

    for (let d = found; d >= 0; d -= 1) {
        const step = trace[d];
        const at = (k: number): number => step[k + d];
        const k = x - y;
        const prevK = k === -d || (k !== d && at(k - 1) < at(k + 1)) ? k + 1 : k - 1;
        const prevX = d === 0 ? 0 : at(prevK);
        const prevY = d === 0 ? 0 : prevX - prevK;

        while (x > prevX && y > prevY) {
            x -= 1;
            y -= 1;
            matches.push([x, y]);
        }

        x = prevX;
        y = prevY;
    }

    return matches.reverse();
}

// ============================================================
// 差异块 → 字符区间
// ============================================================

/**
 * 把逐行差异块翻译成旧文本上的字符区间替换。
 * 行以 '\n' 切分、以 '\n' 拼回，因此替换后的文本与 b.join('\n') 逐字相同。
 */
export function hunksToOffsetChanges(
    a: readonly string[],
    b: readonly string[],
    hunks: readonly LineHunk[],
): OffsetChange[] {
    const starts: number[] = [0];

    for (let index = 0; index < a.length; index += 1) starts.push(starts[index] + a[index].length + 1);

    const docLength = starts[a.length] - 1;
    const changes: OffsetChange[] = [];

    for (const hunk of hunks) {
        const lines = b.slice(hunk.fromB, hunk.toB);

        if (hunk.toA < a.length) {
            // 旧段每行都带着自己的 '\n'，新段照样每行补一个
            changes.push({
                from: starts[hunk.fromA],
                to: starts[hunk.toA],
                text: lines.map((line) => `${line}\n`).join(''),
            });
        } else if (hunk.fromA > 0) {
            // 一直改到文末：从前一行末尾的 '\n' 起替换，新段每行前补 '\n'
            changes.push({
                from: starts[hunk.fromA] - 1,
                to: docLength,
                text: lines.map((line) => `\n${line}`).join(''),
            });
        } else {
            changes.push({ from: 0, to: docLength, text: lines.join('\n') });
        }
    }

    return changes;
}
