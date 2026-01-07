import { shortLinkAPI } from '@swissgeo/api'
import log from '@swissgeo/log'

import type { ShareStore } from '@/store/modules/share/types'
import type { ActionDispatcher } from '@/store/types'

export default function generateShortLinks(
    this: ShareStore,
    withCrosshair: boolean = false,
    dispatcher: ActionDispatcher
): void {
    shortLinkAPI
        .createShortLink(window.location.href, withCrosshair)
        .then((shortLink) => {
            if (shortLink) {
                this.setShortLink(shortLink, dispatcher)
            }
        })
        .catch((err) => {
            log.error({
                title: 'Share store: Generate Short Links',
                messages: ['Error while creating short link for', window.location.href, err],
            })
            this.setShortLink(window.location.href, dispatcher)
        })
}
