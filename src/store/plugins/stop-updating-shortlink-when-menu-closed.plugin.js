/**
 * Redo the search results on lang change if the search query is defined
 *
 * @param {Vuex.Store} store
 */
const stopUpdatingShortLinkWhenMenuClosedPlugin = (store) => {
    store.subscribe((mutation, state) => {
        // when the user closes the menu, even though the share section is visible
        // we shouldn't keep updating the short link (as the user has no intention to copy it right now, so we
        // will just create unused short links if we do so)
        // as soon as the menu is opened again (and the share section is still visible) we reactivate the update of the short link
        if (mutation.type === 'setMenuDesktopOpen') {
            // de-activating short link update as menu is closed
            if (!state.ui.menuDesktopOpen && state.share.keepUpdatingShortLink) {
                store.dispatch('toggleKeepUpdatingShortLink')
            } else if (state.ui.menuDesktopOpen) {
                // TODO document why this block is empty
            }
        }
    })
}

export default stopUpdatingShortLinkWhenMenuClosedPlugin
