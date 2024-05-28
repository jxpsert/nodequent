/**
 * Logger class to log messages to console
 */
export class Logger {

    private static prefix: string = 'NODEQUENT:';

    public static log(message: string) {
        console.log(Logger.prefix, message);
    }

    public static error(message: string) {
        console.error(Logger.prefix, message);
    }

    public static warn(message: string) {
        console.warn(Logger.prefix, message);
    }

    public static info(message: string) {
        console.info(Logger.prefix, message);
    }
}