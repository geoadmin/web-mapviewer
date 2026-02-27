import type { ActionDispatcher, DrawingStore } from '~/types/drawingStore'

import { shortLinkAPI } from '@swissgeo/api'
import log from '@swissgeo/log'
import { getViewerBaseUrl } from '@swissgeo/staging-config'
import { logConfig } from '#imports'

export default async function generateShareLinks(this: DrawingStore, dispatcher: ActionDispatcher) {
    const encodedLayerID = encodeURI(this.layer.config.id)
    const publicUrl = `${getViewerBaseUrl(this.debug.staging)}#/map?layers=${encodedLayerID}`

    if (!this.share.publicLink) {
        try {
            this.share.publicLink = await shortLinkAPI.createShortLink({
                url: publicUrl,
                staging: this.debug.staging,
            })
        } catch (error) {
            log.warn({
                ...logConfig,
                messages: [
                    `Failed to generate share link for public URL, falling back to using the full URL`,
                    error,
                ],
            })
            this.share.publicLink = publicUrl
        }
    }
    if (!this.share.adminLink && this.layer.config?.adminId) {
        const adminUrl = publicUrl.replace(
            encodedLayerID,
            `${encodedLayerID}@adminId=${this.layer.config.adminId}`
        )
        try {
            this.share.adminLink = await shortLinkAPI.createShortLink({
                url: adminUrl,
                staging: this.debug.staging,
            })
        } catch (error) {
            log.warn({
                ...logConfig,
                messages: [
                    `Failed to generate share link for admin/edit later URL, falling back to using the full URL`,
                    error,
                ],
            })
            this.share.adminLink = adminUrl
        }
    }
}
