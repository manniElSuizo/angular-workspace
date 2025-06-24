export class StringUtils {
    public static nullOnEmptyString(s: string): string | null {
        if (s && s.trim().length > 0) return s;
        return null;
    }

    public static zeroPadLeft(s: string | number, requiredLength: number): string {
        if(!s) {
            return null;
        }

        let result = `${s}`;
        if(result.length >= requiredLength) {
            return result.substring(0, requiredLength);
        }

        while(result.length < requiredLength) {
            result = `0${result}`;
        }

        return result;
    }
}
