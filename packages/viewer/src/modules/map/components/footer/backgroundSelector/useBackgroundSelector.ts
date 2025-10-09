import { ref } from 'vue'

/**
 * Centralisation of the logic behind the background selector. This helps us define two flavors of
 * background selector with the same Vue code basis.
 */
export default function useBackgroundSelector(
    _backgroundLayers: Array<{ id: string } | undefined>,
    _currentBackgroundLayer: { id: string } | undefined,
    emit: (event: 'selectBackground', backgroundLayer: string | undefined) => void
) {
    const show = ref(false)
    const animate = ref(false)
    function getImageForBackgroundLayer(backgroundLayer: { id: string } | undefined) {
        let backgroundId = backgroundLayer?.id
        if (!backgroundId) {
            backgroundId = 'void'
        }
        return new URL(`../../../assets/${backgroundId}.png`, import.meta.url).href
    }
    function onSelectBackground(backgroundLayer: string | undefined) {
        emit('selectBackground', backgroundLayer)
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