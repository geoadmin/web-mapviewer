import { LogPreDefinedColor } from '@swissgeo/log'

export function logConfig(titleDetail?: string) {
    let title = '@swissgeo/drawing'
    if (titleDetail) {
        title += ` - ${titleDetail}`
    }
    return {
        title,
        titleColor: LogPreDefinedColor.Cyan,
    }
}
