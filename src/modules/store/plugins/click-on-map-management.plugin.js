import { isMobile } from 'mobile-device-detect';

const clickOnMapManagementPlugin = store => {
    store.subscribe((mutation, state) => {
        if (mutation.type === 'setClickInfo') {
            // if mobile, we manage long click (>500ms) as "identify" and short click (<500ms) as "fullscreen toggle"
            if (isMobile) {
                if (state.map.clickInfo.millisecondsSpentMouseDown < 500) {
                    store.dispatch('toggleHeader')
                    store.dispatch('toggleFooter')
                } else {
                    // TODO: identify
                }
            } else {
                // for Desktop, click is always an "identify"
                // TODO: identify
            }
        }
    });
}

export default clickOnMapManagementPlugin;
