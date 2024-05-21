<script setup>
import { computed, ref } from 'vue'

import TimeSliderDropdownList from '@/modules/map/components/toolbox/TimeSliderDropdownSearchList.vue'

const emit = defineEmits(['update:modelValue', 'play'])

const props = defineProps({
    modelValue: {
        type: [Number, String],
        required: true,
    },
    entries: {
        type: Array,
        default: () => [],
    },
    isPlaying: {
        type: Boolean,
        default: false,
    },
})

const isDropdownOpen = ref(false)
const inputValue = ref('')
// reference to the component
const searchList = ref(null)

// reference to the input
const input = ref(null)

const displayEntry = computed({
    get() {
        if (isDropdownOpen.value) {
            return inputValue.value
        } else {
            return props.modelValue
        }
    },
    set(value) {
        inputValue.value = value
    },
})

const dropdownEntries = computed(() => {
    return props.entries
        .filter((entry) => {
            if (inputValue.value) {
                return entry.toString().includes(inputValue.value)
            } else {
                // nothing searching, return all
                return true
            }
        })
        .map((entry) => ({
            htmlDisplay: entry.toString(),
            emphasize: inputValue.value?.toString() || '',
            url: entry,
        }))
})

function toggleList() {
    if (isDropdownOpen.value) {
        closeList()
    } else {
        openList()
    }
}

function openList() {
    isDropdownOpen.value = true
}

function closeList() {
    isDropdownOpen.value = false
    inputValue.value = null
}

function chooseEntry(value) {
    emit('update:modelValue', value)
    closeList()
}

function focusSearchlist() {
    if (inputValue.value) {
        searchList.value.goToFirst()
    } else {
        searchList.value.goToSpecific(props.modelValue)
    }
}

function onEnter() {
    if (inputValue.value.length == 4) {
        emit('update:modelValue', inputValue.value)
        input.value.blur()
        closeList()
    }
}
</script>

<template>
    <div v-click-outside="closeList">
        <div class="d-flex">
            <form
                action=""
                class="input-group input-group-append"
                data-cy="searchable-dropdown"
                @submit.prevent
            >
                <input
                    ref="input"
                    :value="displayEntry"
                    class="form-control rounded-end-0"
                    :class="{ 'rounded-bottom-0': isDropdownOpen }"
                    @input="inputValue = $event.target.value"
                    @focusin="openList"
                    @keydown.esc.prevent="closeList"
                    @keydown.down.prevent="focusSearchlist"
                    @keydown.enter.prevent="onEnter"
                />

                <div class="input-group-append btn-group">
                    <button
                        class="btn border btn-outline-group d-flex align-items-center rounded-start-0 rounded-end-0"
                        :class="{
                            'url-input-dropdown-open': isDropdownOpen,
                        }"
                        type="button"
                        data-cy="import-catalogue-providers-toggle"
                        @click="toggleList"
                    >
                        <FontAwesomeIcon
                            :icon="isDropdownOpen ? 'caret-up' : 'caret-down'"
                            size="lg"
                        />
                    </button>
                    <button
                        ref="playButton"
                        data-cy="time-slider-play-button"
                        class="btn btn-outline-group d-flex align-items-center px-3 border rounded-start-0"
                        :class="{ 'rounded-bottom-0': isDropdownOpen }"
                        @click="emit('play')"
                    >
                        <FontAwesomeIcon :icon="isPlaying ? 'pause' : 'play'" size="sm" />
                    </button>
                </div>
            </form>
        </div>
        <TimeSliderDropdownList
            ref="searchList"
            :entries="dropdownEntries"
            :show-list="isDropdownOpen"
            @choose-entry="chooseEntry"
        />
    </div>
</template>
