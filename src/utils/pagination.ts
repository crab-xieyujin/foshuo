import type { FontSize } from "../store/useSettingsStore";

// 竖排布局：每列字数 = 页面高度 / 字体大小，列数 = 页面宽度 / 字体大小
// 实际屏幕约 390×800, 去掉 header(52px) + nav(52px) = 约 696px 可用高度
// 字体调整后：
// small (14px): 每列 ~44字, 22列
// medium (18px): 每列 ~34字, 17列
// large (20px): 每列 ~30字, 15列
// huge (24px): 每列 ~25字, 12列
const PAGE_CONFIG: Record<FontSize, { charsPerLine: number; linesPerPage: number }> = {
    small: { charsPerLine: 42, linesPerPage: 21 },
    medium: { charsPerLine: 32, linesPerPage: 16 },
    large: { charsPerLine: 28, linesPerPage: 14 },
    huge: { charsPerLine: 24, linesPerPage: 11 },
};

export function paginateText(text: string, fontSize: FontSize): string[] {
    const config = PAGE_CONFIG[fontSize];
    const pages: string[] = [];

    const capacity = config.charsPerLine * config.linesPerPage;
    let remainingText = text.replace(/\r\n/g, '\n').replace(/\n{3,}/g, '\n\n');

    while (remainingText.length > 0) {
        let cutIndex = Math.min(remainingText.length, capacity);

        // 尽量在标点处断开，避免割裂词句
        if (cutIndex < remainingText.length) {
            const scanRange = Math.min(80, cutIndex);
            const sub = remainingText.substring(cutIndex - scanRange, cutIndex);
            const lastPunct = findLastPunctuation(sub);
            if (lastPunct !== -1) {
                cutIndex = cutIndex - scanRange + lastPunct + 1;
            }
        }

        pages.push(remainingText.substring(0, cutIndex));
        remainingText = remainingText.substring(cutIndex).trimStart();
    }

    return pages;
}

function findLastPunctuation(text: string): number {
    const punctuations = ['。', '！', '？', '；', '：', '，', '\n'];
    let maxIndex = -1;
    for (const p of punctuations) {
        const idx = text.lastIndexOf(p);
        if (idx > maxIndex) maxIndex = idx;
    }
    return maxIndex;
}
