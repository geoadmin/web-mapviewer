declare interface GeoadminLog {
    wantedLevels: LogLevel[];
    debug: (...messages: GeoadminLogInput[]) => void;
    info: (...messages: GeoadminLogInput[]) => void;
    warn: (...messages: GeoadminLogInput[]) => void;
    error: (...messages: GeoadminLogInput[]) => void;
}

export declare type GeoadminLogInput = GeoadminLogMessage | string | number | boolean | object;

declare interface GeoadminLogMessage {
    title?: string;
    titleColor?: LogPreDefinedColor | string;
    messages: GeoadminLogInput[];
}

/**
 * Logs the provided parameters to the console.
 *
 * By default, only calls with LogLevel.Error and LogLevel.Warn will be logged (calls to info and
 * debug will be ignored). If you want more logging, set the variable `log.wantedLevels` to your
 * desired list of LogLevel
 */
declare const log: GeoadminLog;
export default log;

/** @module geoadmin/log */
/** A log level reference. The levels correspond to the native console methods and their log level. */
export declare enum LogLevel {
    Error = 0,
    Warn = 1,
    Info = 2,
    Debug = 3
}

/**
 * Colors coming from TailwindCSS colors, taking the column 500
 *
 * @see https://tailwindcss.com/docs/colors
 */
export declare enum LogPreDefinedColor {
    Red = "oklch(63.7% 0.237 25.331)",
    Orange = "oklch(70.5% 0.213 47.604)",
    Amber = "oklch(76.9% 0.188 70.08)",
    Yellow = "oklch(79.5% 0.184 86.047)",
    Lime = "oklch(76.8% 0.233 130.85)",
    Green = "oklch(72.3% 0.219 149.579)",
    Emerald = "oklch(69.6% 0.17 162.48)",
    Teal = "oklch(70.4% 0.14 182.503)",
    Cyan = "oklch(71.5% 0.143 215.221)",
    Sky = "oklch(68.5% 0.169 237.323)",
    Blue = "oklch(62.3% 0.214 259.815)",
    Indigo = "oklch(58.5% 0.233 277.117)",
    Violet = "oklch(60.6% 0.25 292.717)",
    Purple = "oklch(62.7% 0.265 303.9)",
    Fuchsia = "oklch(66.7% 0.295 322.15)",
    Pink = "oklch(65.6% 0.241 354.308)",
    Rose = "oklch(64.5% 0.246 16.439)",
    Slate = "oklch(55.4% 0.046 257.417)",
    Gray = "oklch(55.1% 0.027 264.364)",
    Zinc = "oklch(55.2% 0.016 285.938)",
    Neutral = "oklch(55.6% 0 0)",
    Stone = "oklch(55.3% 0.013 58.071)"
}

export { }
