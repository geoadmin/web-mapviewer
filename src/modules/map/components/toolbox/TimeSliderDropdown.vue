<script setup>
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useStore } from 'vuex'

import TimeSliderDropdownList from '@/modules/map/components/toolbox/TimeSliderDropdownSearchList.vue'

import { useRangeTippy } from './useRangeTippy'

const { t } = useI18n()
const store = useStore()

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

function tooltipContent() {
    const firstEntry = props.entries[0]
    const lastEntry = props.entries[props.entries.length - 1]
    return `${t('outside_valid_year_range')} ${firstEntry}-${lastEntry}`
}

const { tippyInstance: yearInputError, updateTippyContent } = useRangeTippy(
    () => input.value,
    tooltipContent
)

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
    yearInputError.value.hide()
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
    if (props.entries.includes(parseInt(inputValue.value))) {
        chooseEntry(inputValue.value)
        input.value.blur()
    } else {
        yearInputError.value.show()
    }
}

/**
 * When the user leaves the input, the year gets reset to the the currentYear. In some cases, the
 * tippy isn't being hidden though, which is why we do it explicitly here
 */
function onFocusOut() {
    yearInputError.value.hide()
}

// i18n.t isn't reactive, therefore we need to update the content
// ourselves
watch(
    () => store.state.i18n.lang,
    () => {
        updateTippyContent(tooltipContent)
    }
)
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
                    @focusout="onFocusOut"
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
