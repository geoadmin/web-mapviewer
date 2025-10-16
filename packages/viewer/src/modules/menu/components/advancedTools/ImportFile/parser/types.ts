export interface OnlineFileCompliance {
    mimeType?: string
    supportsCORS: boolean
    supportsHTTPS: boolean
}

export interface ParseConfig {
    fileSource: File | string
    currentProjection: import('@swissgeo/coordinates').CoordinateSystem
}

export interface ParseOptions {
    timeout?: number
    fileCompliance?: OnlineFileCompliance
    loadedContent?: ArrayBuffer
}

export type ValidateFileContent = (content: ArrayBuffer) => boolean
