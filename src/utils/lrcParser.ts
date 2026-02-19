export interface LyricLine {
    time: number; // in seconds
    text: string;
}

export function parseLrc(lrc: string): LyricLine[] {
    const lines = lrc.split('\n');
    const result: LyricLine[] = [];
    const timeExp = /\[(\d{2}):(\d{2})\.(\d{2,3})\]/;

    for (const line of lines) {
        const match = timeExp.exec(line);
        if (match) {
            const minutes = parseInt(match[1], 10);
            const seconds = parseInt(match[2], 10);
            const milliseconds = parseInt(match[3], 10);
            // normalize milliseconds to seconds (if 2 digits, it's 10ms unit, if 3 it's 1ms unit)
            // Usually .xx is centiseconds (10ms)
            const msInSeconds = match[3].length === 2 ? milliseconds / 100 : milliseconds / 1000;

            const time = minutes * 60 + seconds + msInSeconds;
            const text = line.replace(timeExp, '').trim();

            if (text) {
                result.push({ time, text });
            }
        }
    }

    return result.sort((a, b) => a.time - b.time);
}
