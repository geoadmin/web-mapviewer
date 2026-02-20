/** @module geoadmin/log */

/** A log level reference. The levels correspond to the native console methods and their log level. */
export enum LogLevel {
    Error,
    Warn,
    Info,
    Debug,
}

/**
 * Colors coming from TailwindCSS colors, taking the column 500
 *
 * @see https://tailwindcss.com/docs/colors
 */
export enum LogPreDefinedColor {
    Red = 'oklch(63.7% 0.237 25.331)',
    Orange = 'oklch(70.5% 0.213 47.604)',
    Amber = 'oklch(76.9% 0.188 70.08)',
    Yellow = 'oklch(79.5% 0.184 86.047)',
    Lime = 'oklch(76.8% 0.233 130.85)',
    Green = 'oklch(72.3% 0.219 149.579)',
    Emerald = 'oklch(69.6% 0.17 162.48)',
    Teal = 'oklch(70.4% 0.14 182.503)',
    Cyan = 'oklch(71.5% 0.143 215.221)',
    Sky = 'oklch(68.5% 0.169 237.323)',
    Blue = 'oklch(62.3% 0.214 259.815)',
    Indigo = 'oklch(58.5% 0.233 277.117)',
    Violet = 'oklch(60.6% 0.25 292.717)',
    Purple = 'oklch(62.7% 0.265 303.9)',
    Fuchsia = 'oklch(66.7% 0.295 322.15)',
    Pink = 'oklch(65.6% 0.241 354.308)',
    Rose = 'oklch(64.5% 0.246 16.439)',
    Slate = 'oklch(55.4% 0.046 257.417)',
    Gray = 'oklch(55.1% 0.027 264.364)',
    Zinc = 'oklch(55.2% 0.016 285.938)',
    Neutral = 'oklch(55.6% 0 0)',
    Stone = 'oklch(55.3% 0.013 58.071)',
}

function generateBackgroundStyle(color: LogPreDefinedColor | string): string {
    return `color: #000; font-weight: bold; background-color: ${color}; padding: 2px 4px; border-radius: 4px;`
}

function processStyle(messages: GeoadminLogInput[]): GeoadminLogInput[] {
    return messages.flatMap((message) => {
        if (
            message &&
            typeof message === 'object' &&
            'messages' in message &&
            Array.isArray(message.messages)
        ) {
            const mappedMessage: GeoadminLogInput[] = []
            // checking if we are dealing with a GeoadminLogMessage instance
            if ('title' in message && typeof message.title === 'string') {
                mappedMessage.push(`%c[${message.title}]%c`)

                let titleBackgroundColor: LogPreDefinedColor | string = LogPreDefinedColor.Slate
                if ('titleColor' in message && typeof message.titleColor === 'string') {
                    titleBackgroundColor = message.titleColor
                }
                mappedMessage.push(generateBackgroundStyle(titleBackgroundColor))
                // reset the style (for the second %c in the title string)
                mappedMessage.push('')
            }
            mappedMessage.push(...message.messages)
            return mappedMessage
        }
        // it's something else than a GeoadminLogMessage, just passing it along
        return message
    })
}

function logToConsole(level: LogLevel, messages: GeoadminLogInput[]) {
    if (!log.wantedLevels.includes(level)) {
        return
    }
     
    switch (level) {
        case LogLevel.Error:
            console.error(...processStyle(messages))
            break
        case LogLevel.Warn:
            console.warn(...processStyle(messages))
            break
        case LogLevel.Info:
            console.info(...processStyle(messages))
            break
        case LogLevel.Debug:
            console.debug(...processStyle(messages))
            break
    }
     
}

interface GeoadminLogMessage {
    title?: string
    titleColor?: LogPreDefinedColor | string
    messages: GeoadminLogInput[]
}

type GeoadminLogInput = GeoadminLogMessage | string | number | boolean | object

interface GeoadminLog {
    wantedLevels: LogLevel[]
    debug: (...messages: GeoadminLogInput[]) => void
    info: (...messages: GeoadminLogInput[]) => void
    warn: (...messages: GeoadminLogInput[]) => void
    error: (...messages: GeoadminLogInput[]) => void
}

/**
 * Logs the provided parameters to the console.
 *
 * By default, only calls with LogLevel.Error and LogLevel.Warn will be logged (calls to info and
 * debug will be ignored). If you want more logging, set the variable `log.wantedLevels` to your
 * desired list of LogLevel
 */
const log: GeoadminLog = {
    wantedLevels: [LogLevel.Error, LogLevel.Warn],
    error: (...messages: GeoadminLogInput[]) => logToConsole(LogLevel.Error, messages),
    warn: (...messages: GeoadminLogInput[]) => logToConsole(LogLevel.Warn, messages),
    info: (...messages: GeoadminLogInput[]) => logToConsole(LogLevel.Info, messages),
    debug: (...messages: GeoadminLogInput[]) => logToConsole(LogLevel.Debug, messages),
}
export default log
