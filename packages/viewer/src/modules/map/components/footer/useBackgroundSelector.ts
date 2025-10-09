import { ref } from 'vue'

export function useBackgroundSelector() {
    const selectedBackground = ref<string>('')
    const backgrounds = ref<Array<{ id: string; label: string }>>([])

    function setBackgrounds(newBackgrounds: Array<{ id: string; label: string }>) {
        backgrounds.value = newBackgrounds
    }

    function selectBackground(id: string) {
        selectedBackground.value = id
    }

    return {
        selectedBackground,
        backgrounds,
        setBackgrounds,
        selectBackground,
    }
}