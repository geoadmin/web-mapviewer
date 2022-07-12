import { createShortLink } from '@/api/shortlink.api'
import log from '@/utils/logging'

export default {
    state: {
        /**
         * Short link version of the current map position (and layers, and all...). This will not be
         * defined each time, but only when the share menu is opened first (it will then be updated
         * whenever the URL changes to match it)
         *
         * @type String
         */
        shortLink: null,
        /**
         * The state of the shortlink share menu section. As we need to be able to change this
         * whenever the user moves the map, and it should only be done within mutations.
         *
         *
         * @type Boolean
         */
        isMenuSectionShown: false,
    },
    getters: {},
    actions: {
        async generateShortLink({ commit }) {
            try {
                const shortLink = await createShortLink(window.location.href)
                if (shortLink) {
                    commit('setShortLink', shortLink)
                }
            } catch (err) {
                log.error('Error while creating short link for', window.location.href, err)
            }
        },
        closeShareMenuAndRemoveShortlink({ commit }) {
            commit('setIsMenuSectionShown', false)
            commit('setShortLink', null)

        },
        toggleShareMenuSection({ commit, state }) {
            commit('setIsMenuSectionShown', !state.isMenuSectionShown)
        },
        clearShortLink({ commit }) {
            commit('setShortLink', null)
        }
    },
    mutations: {
        setShortLink(state, shortLink) {
            state.shortLink = shortLink
        },
        setIsMenuSectionShown(state, flag) {
            state.isMenuSectionShown = flag
        }
    },
}
