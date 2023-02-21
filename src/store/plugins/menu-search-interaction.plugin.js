/**
 * This plugin will orchestrate the UI interaction between components from the menu, the search bar
 * and the map overlay It will, for instance hide the menu tray if the search results are shown.
 *
 * @param store
 */
const menuSearchBarInteractionManagementPlugin = (store) => {
    store.subscribe((mutation, state) => {
        const hideSearchResultsIfShown = () => {
            if (state.search.show) {
                store.commit('hideSearchResults')
            }
        }
        const hideMenuIfShown = () => {
            if (state.ui.showMenu) {
                store.dispatch('toggleMenu')
            }
        }
        switch (mutation.type) {
            case 'setShowMenu':
                if (state.ui.showMenu) {
                    hideSearchResultsIfShown()
                }
                break
            case 'showSearchResults':
                if (store.getters.isPhoneMode) {
                    hideMenuIfShown()
                }
                break
        }
    })
}

export default menuSearchBarInteractionManagementPlugin
