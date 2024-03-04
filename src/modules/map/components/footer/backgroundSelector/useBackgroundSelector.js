import { ref } from 'vue'

/**
 * Centralisation of the logic behind the background selector. This helps us define two flavors of
 * background selector with the same Vue code basis.
 *
 * @param {(AbstractLayer | null)[]} backgroundLayers All backgrounds defined in the store (void
 *   included, meaning a null value inside the array)
 * @param {AbstractLayer | null} currentBackgroundLayer The background currently displayed on the
 *   map (if none, or void, then a null value can be passed here)
 * @param {EmitFn} emit The emit function built by defineEmit (Vue helper function). It is sadely
 *   not possible to define emit events directly in the composable portion, each component built
 *   with this composable needs to define events itself.
 */
export default function (backgroundLayers, currentBackgroundLayer, emit) {
    const show = ref(false)
    const animate = ref(false)
    function getImageForBackgroundLayer(backgroundLayer) {
        let backgroundId = backgroundLayer?.id
        if (!backgroundId) {
            backgroundId = 'void'
        }
        return new URL(`../../../assets/${backgroundId}.png`, import.meta.url).href
    }
    function onSelectBackground(backgroundLayer) {
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
