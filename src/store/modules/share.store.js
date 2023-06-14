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
         * Same thing as shortLink, but with the flag embed=true send to the backend before
         * shortening
         */
        embeddedShortLink: null,
        /**
         * The state of the shortlink share menu section. As we need to be able to change this
         * whenever the user moves the map, and it should only be done within mutations.
         *
         * @type Boolean
         */
        isMenuSectionShown: false,
    },
    getters: {},
    actions: {
        async generateShortLinks({ commit }, withBalloonMarker = false) {
            const urlWithoutGeolocation =
                // we do not want the geolocation of the user clicking the link to kick in, so we force the flag out of the URL
                window.location.href.replace('&geolocation', '') +
                // if the geolocation was being tracked by the user generating the link, we place a balloon (dropped pin) marker at his position (center of the screen, so no need to change any x/y position)
                (withBalloonMarker ? '&crosshair=marker' : '')
            try {
                const shortLink = await createShortLink(urlWithoutGeolocation)
                if (shortLink) {
                    commit('setShortLink', shortLink)
                }
            } catch (err) {
                log.error('Error while creating short link for', urlWithoutGeolocation, err)
                commit('setShortLink', urlWithoutGeolocation)
            }
            const urlWithEmbed = urlWithoutGeolocation + '&embed'
            try {
                const embeddedShortLink = await createShortLink(urlWithEmbed)
                if (embeddedShortLink) {
                    commit('setEmbeddedShortLink', embeddedShortLink)
                }
            } catch (err) {
                log.error('Error while creating embedded short link for', urlWithEmbed, err)
                commit('setEmbeddedShortLink', urlWithEmbed)
            }
        },
        closeShareMenuAndRemoveShortLinks({ commit, dispatch }) {
            commit('setIsMenuSectionShown', false)
            dispatch('clearShortLinks')
        },
        toggleShareMenuSection({ commit, state }) {
            commit('setIsMenuSectionShown', !state.isMenuSectionShown)
        },
        clearShortLinks({ commit }) {
            commit('setShortLink', null)
            commit('setEmbeddedShortLink', null)
        },
    },
    mutations: {
        setShortLink(state, shortLink) {
            state.shortLink = shortLink
        },
        setEmbeddedShortLink(state, shortLink) {
            state.embeddedShortLink = shortLink
        },
        setIsMenuSectionShown(state, flag) {
            state.isMenuSectionShown = flag
        },
    },
}
