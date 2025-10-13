import { computed } from 'vue'

import { useBackgroundSelector } from './useBackgroundSelector'

export function useBackgroundSelectorProps() {
    const { backgrounds, selectedBackground } = useBackgroundSelector()

    const backgroundProps = computed(() => {
        return backgrounds.value.map((background) => ({
            id: background.id,
            label: background.label,
            isSelected: background.id === selectedBackground.value,
        }))
    })

    return {
        backgroundProps,
    }
}