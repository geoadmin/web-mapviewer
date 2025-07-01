import UrlParamConfig from '@/router/storeSync/UrlParamConfig.class'
import { useUIStore } from '@/store/modules/ui.store'

const hideEmbedUIParam = new UrlParamConfig({
    urlParamName: 'hideEmbedUI',
    mutationsToWatch: ['setHideEmbedUI'],
    dispatchName: 'setHideEmbedUI',
    dispatchValueName: 'hideEmbedUI',
    extractValueFromStore: () => {
        const uiStore = useUIStore()
        return uiStore.hideEmbedUI
    },
    keepInUrlWhenDefault: false,
    valueType: Boolean,
    defaultValue: false,
    validateUrlInput: null,
})

export default hideEmbedUIParam
