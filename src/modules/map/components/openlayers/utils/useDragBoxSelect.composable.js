import { platformModifierKeyOnly } from 'ol/events/condition'
import { DragBox } from 'ol/interaction'
import { useStore } from 'vuex'

const dispatcher = {
    dispatcher: 'useDragBoxSelect.composable',
}

export function useDragBoxSelect() {
    const store = useStore()

    const dragBoxSelect = new DragBox({
        condition: platformModifierKeyOnly,
    })

    dragBoxSelect.on('boxstart', () =>
        store.dispatch('clearAllSelectedFeatures', { ...dispatcher })
    )
    dragBoxSelect.on('boxend', () => {
        const selectExtent = dragBoxSelect.getGeometry()?.getExtent()

        if (selectExtent?.length === 4) {
            store.dispatch('click', {
                clickInfo: { coordinate: selectExtent },
                ...dispatcher,
            })
        }
    })

    return {
        dragBoxSelect,
    }
}
