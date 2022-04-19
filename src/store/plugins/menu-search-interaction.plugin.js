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
        const hideMenuTrayIfShown = () => {
            if (state.ui.showMenuTray) {
                store.dispatch('toggleMenuTray')
            }
        }
        switch (mutation.type) {
            case 'setShowMenuTray':
                if (state.ui.showMenuTray) {
                    hideSearchResultsIfShown()
                }
                break
            case 'showSearchResults':
                hideMenuTrayIfShown()
                break
        }
    })
}

export default menuSearchBarInteractionManagementPlugin
