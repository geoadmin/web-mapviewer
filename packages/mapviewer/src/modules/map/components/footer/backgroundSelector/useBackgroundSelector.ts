import type { Layer } from '@swissgeo/layers'

import { ref } from 'vue'

/**
 * Centralisation of the logic behind the background selector. This helps us define two flavors of
 * background selector with the same Vue code basis.
 */
export default function useBackgroundSelector(
    selectBackgroundCallback: (backgroundLayerId?: string) => void
) {
    const show = ref<boolean>(false)
    const animate = ref<boolean>(false)

    function getImageForBackgroundLayer(backgroundLayer?: Layer) {
        let backgroundId = backgroundLayer?.id
        if (!backgroundId) {
            backgroundId = 'void'
        }
        return new URL(`../../../assets/${backgroundId}.png`, import.meta.url).href
    }
    function onSelectBackground(backgroundLayerId: string | undefined) {
        selectBackgroundCallback(backgroundLayerId)
        toggleShowSelector()
    }
    function toggleShowSelector() {
        show.value = !show.value

        animate.value = true
        // waiting a short time, so that the animation can kick in, them remove the flag
        setTimeout(() => {
            animate.value = false
        }, 100)
    }

    return {
        show,
        animate,
        getImageForBackgroundLayer,
        onSelectBackground,
        toggleShowSelector,
    }
}
