export class Helper {

    public static zeroPad(num: number, places: number): string {
        return String(num).padStart(places, '0');
    }

    public static dateTimeFormat(date) {
        if (!date) return null;
        const seconds = this.zeroPad(date.getSeconds(), 2);
        const minutes = this.zeroPad(date.getMinutes(), 2);
        const hours = this.zeroPad(date.getHours(), 2);
        const day = this.zeroPad(date.getDate(), 2);
        const month = this.zeroPad(date.getMonth() + 1, 2);
        const year = date.getFullYear();

        return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    }
}