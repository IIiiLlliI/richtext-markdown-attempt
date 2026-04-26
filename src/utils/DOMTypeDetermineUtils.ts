export function isDigitType(char: string): boolean {
    const code = char.charCodeAt(0);
    return code >= 49 && code <= 57;  // '1' 到 '9' 的 ASCII 码
}

export function isDigit(char: string): boolean {
    const code = char.charCodeAt(0);
    return code >= 48 && code <= 57;  // '0' 到 '9' 的 ASCII 码
}

export function findFirstNotOfFrom(str: string, char: string, startIndex = 0) {
    // 边界检查
    startIndex = Math.max(0, Math.min(startIndex, str.length));

    for (let i = startIndex; i < str.length; i++) {
        if (str.slice(i, i + char.length) !== char) {
            return i;
        }
    }
    return -1;
}

console.log(findFirstNotOfFrom("123\n", "\n", 0))