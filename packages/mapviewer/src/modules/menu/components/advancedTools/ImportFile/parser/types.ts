import type { CoordinateSystem } from '@swissgeo/coordinates'

export interface OnlineFileCompliance {
    mimeType?: string
    supportsCORS: boolean
    supportsHTTPS: boolean
}

export interface ParseConfig {
    fileSource: File | string
    currentProjection: CoordinateSystem
}

export interface ParseOptions {
    timeout?: number
    fileCompliance?: OnlineFileCompliance
    loadedContent?: ArrayBuffer | string
}

export type ValidateFileContent = (content: ArrayBuffer | string) => boolean
