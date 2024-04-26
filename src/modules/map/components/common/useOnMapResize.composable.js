import { computed, onBeforeUnmount, onMounted, toValue } from 'vue'
import { useStore } from 'vuex'

const dispatcher = { dispatcher: 'useOnMapResize.composable' }

/**
 * Composable receiving a reference to a map HTML element (or any HTML element... but the goal is to
 * give the map element here) and will trigger a store dispatch to set the map size anytime this
 * element is resized
 *
 * @param {Readonly<Ref<HTMLElement>>} mapElement
 */
export default function useOnMapResize(mapElement) {
    const store = useStore()

    const currentSize = computed(() => {
        return {
            width: store.state.map.width,
            height: store.state.map.height,
        }
    })

    let mapSizeObserver
    onMounted(() => {
        mapSizeObserver = new ResizeObserver(onMapResize)
        mapSizeObserver.observe(toValue(mapElement))
    })

    onBeforeUnmount(() => {
        mapSizeObserver.unobserve(toValue(mapElement))
    })

    function onMapResize() {
        const element = toValue(mapElement)
        if (
            element &&
            (currentSize.value.height !== element.offsetHeight ||
                currentSize.value.width !== element.offsetWidth)
        ) {
            store.dispatch('setMapSize', {
                size: {
                    width: element.offsetWidth,
                    height: element.offsetHeight,
                },
                ...dispatcher,
            })
        }
    }
}
