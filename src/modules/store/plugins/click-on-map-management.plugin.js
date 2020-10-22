const clickOnMapManagementPlugin = store => {
    store.subscribe((mutation, state) => {
        if (mutation.type === 'setClickInfo') {
            // if screen size is smcaller than a tablet screen, we manage long click (>500ms) as "identify"
            // and short click (<500ms) as "fullscreen toggle"
            if (state.size.width <= 900) {
                if (state.map.clickInfo.millisecondsSpentMouseDown < 500) {
                    store.dispatch('toggleHeader')
                } else {
                    // TODO: identify
                }
            } else {
                // TODO: identify
            }
        }
    });
}

export default clickOnMapManagementPlugin;
