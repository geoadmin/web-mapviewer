import log from '@swissgeo/log'
import { defineStore } from 'pinia'

import type { ActionDispatcher } from '@/store/types'

import { createShortLink } from '@/api/shortlink.api.js'

interface ShareStoreState {
    shortLink: string | null
    isMenuSectionShown: boolean
}

const useShareStore = defineStore('share', {
    state: (): ShareStoreState => ({
        /**
         * Short link version of the current map position (and layers, and all...). This will not be
         * defined each time, but only when the share menu is opened first (it will then be updated
         * whenever the URL changes to match it)
         */
        shortLink: null,
        /**
         * The state of the shortlink share menu section. As we need to be able to change this
         * whenever the user moves the map, and it should only be done within mutations.
         */
        isMenuSectionShown: false,
    }),
    actions: {
        setShortLink(shortLink: string | null, dispatcher: ActionDispatcher) {
            this.shortLink = shortLink
        },
        setIsMenuSectionShown(show: boolean, dispatcher: ActionDispatcher) {
            this.isMenuSectionShown = show
        },

        async generateShortLinks(withCrosshair: boolean = false, dispatcher: ActionDispatcher) {
            try {
                const shortLink = await createShortLink(window.location.href, withCrosshair)

                if (shortLink) {
                    this.setShortLink(shortLink, dispatcher)
                }
            } catch (err) {
                log.error({messages: ['Error while creating short link for', window.location.href, err]})
                this.setShortLink(window.location.href, dispatcher)
            }
        },
        closeShareMenuAndRemoveShortLinks(dispatcher: ActionDispatcher) {
            this.setIsMenuSectionShown(false, dispatcher )
            this.clearShortLinks(dispatcher)
        },
        toggleShareMenuSection(dispatcher: ActionDispatcher) {
            this.setIsMenuSectionShown(!this.isMenuSectionShown, dispatcher )
        },
        clearShortLinks(dispatcher: ActionDispatcher ) {
            this.shortLink =  null
        },
    },
})

export default useShareStore
