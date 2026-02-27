export interface FileAPIMetadataResponse {
    id: string
    admin_id: string
    created: string
    updated: string
    author: string
    author_version: string
    links: {
        metadata: string
        kml: string
    }
}

export interface OnlineFileCompliance {
    mimeType?: string
    supportsCORS: boolean
    supportsHTTPS: boolean
}
