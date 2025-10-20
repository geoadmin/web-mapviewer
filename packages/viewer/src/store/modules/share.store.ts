import log from '@swissgeo/log'
import { defineStore } from 'pinia'

import type { ActionDispatcher } from '@/store/types'

import { createShortLink } from '@/api/shortlink.api'
import { ShareStoreActions } from '@/store/actions'

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
        [ShareStoreActions.SetShortLink](shortLink: string | null, dispatcher: ActionDispatcher) {
            this.shortLink = shortLink
        },
        [ShareStoreActions.SetIsMenuSectionShown](show: boolean, dispatcher: ActionDispatcher) {
            this.isMenuSectionShown = show
        },

        async [ShareStoreActions.GenerateShortLinks](
            withCrosshair: boolean = false,
            dispatcher: ActionDispatcher
        ) {
            try {
                const shortLink = await createShortLink(window.location.href, withCrosshair)

                if (shortLink) {
                    this.setShortLink(shortLink, dispatcher)
                }
            } catch (err) {
                log.error({
                    messages: ['Error while creating short link for', window.location.href, err],
                })
                this.setShortLink(window.location.href, dispatcher)
            }
        },
        [ShareStoreActions.CloseShareMenuAndRemoveShortLinks](dispatcher: ActionDispatcher) {
            this.setIsMenuSectionShown(false, dispatcher)
            this.clearShortLinks(dispatcher)
        },
        [ShareStoreActions.ToggleShareMenuSection](dispatcher: ActionDispatcher) {
            this.setIsMenuSectionShown(!this.isMenuSectionShown, dispatcher)
        },
        [ShareStoreActions.ClearShortLinks](dispatcher: ActionDispatcher) {
            this.shortLink = null
        },
    },
})

export default useShareStore
