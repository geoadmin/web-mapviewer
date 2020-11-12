/**
 * This plugin will orchestrate the UI interaction between components from the menu, the search bar and the map overlay
 * It will, for instance, show the overlay when the menu tray is shown, and then hide the menu tray if the overlay is clicked.
 * Or it will hide the menu tray if the search results are shown.
 * @param store
 */
const menuSearchBarAndOverlayInteractionManagementPlugin = store => {
    store.subscribe((mutation, state) => {
        // flag in order to avoid infinite loop call to hideMenuTray (when the overlay will hide we will call
        // hideMenuTray only if this plugin didn't initiate the overlay hide action)
        let hideMenuTrayPending = false;
        const onOverlayClose = () => {
            if (!hideMenuTrayPending) {
                // when overlay has been clicked, we hide the menu tray
                hideMenuTrayPending = true;
                hideMenuTrayIfShown();
            }
        }
        const hideOverlayIfShown = () => {
            if (state.overlay.show) {
                store.commit('hideOverlay');
            }
        }
        const showOverlayIfHidden = () => {
            if (!state.overlay.show) {
                store.commit('showOverlay', onOverlayClose);
            }
        }
        const hideSearchResultsIfShown = () => {
            if (state.search.show) {
                store.commit('hideSearchResults')
            }
        }
        const hideMenuTrayIfShown = () => {
            if (state.ui.showMenuTray) {
                store.dispatch('toggleMenuTray');
            }
        }
        switch (mutation.type) {
            case 'setShowMenuTray':
                if (state.ui.showMenuTray) {
                    showOverlayIfHidden();
                    hideSearchResultsIfShown()
                } else {
                    if (hideMenuTrayPending) {
                        hideMenuTrayPending = false;
                    } else {
                        hideOverlayIfShown()
                    }
                }
                break;
            case 'showSearchResults':
                hideMenuTrayIfShown();
                hideOverlayIfShown();
                break;
        }
    });
}

export default menuSearchBarAndOverlayInteractionManagementPlugin;
