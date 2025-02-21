<script setup>
import { computed, ref, useTemplateRef } from 'vue'
import { useI18n } from 'vue-i18n'

import TimeSliderDropdownList from '@/modules/map/components/toolbox/TimeSliderDropdownSearchList.vue'
import GeoadminTooltip from '@/utils/components/GeoadminTooltip.vue'

const { t } = useI18n()

const emit = defineEmits(['update:modelValue', 'play'])

const { modelValue, entries, isPlaying } = defineProps({
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

const searchList = useTemplateRef('searchList')
const input = useTemplateRef('input')
const errorTooltip = useTemplateRef('errorTooltip')

const tooltipContent = computed(() => {
    const firstEntry = entries[0]
    const lastEntry = entries[entries.length - 1]
    return `${t('outside_valid_year_range')} ${firstEntry}-${lastEntry}`
})

const displayEntry = computed({
    get() {
        if (isDropdownOpen.value) {
            return inputValue.value
        }
        return modelValue
    },
    set(value) {
        inputValue.value = value
    },
})

const dropdownEntries = computed(() => {
    return entries
        .filter((entry) => !inputValue.value || entry.toString().includes(inputValue.value))
        .map((entry) => ({
            htmlDisplay: entry.toString(),
            emphasize: inputValue.value?.toString() ?? '',
            year: entry,
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
    errorTooltip.value.closeTooltip()
    closeList()
}

function focusSearchlist() {
    if (inputValue.value) {
        searchList.value.goToFirst()
    } else {
        searchList.value.goToSpecific(modelValue)
    }
}

function onEnter() {
    if (entries.includes(parseInt(inputValue.value))) {
        chooseEntry(inputValue.value)
        input.value.blur()
    } else {
        errorTooltip.value.openTooltip()
    }
}

/**
 * When the user leaves the input, the year gets reset to the the currentYear. In some cases, the
 * tooltip isn't being hidden though, which is why we do it explicitly here
 */
function onFocusOut() {
    errorTooltip.value.closeTooltip()
}
</script>

<template>
    <div v-click-outside="closeList">
        <div class="d-flex">
            <form
                action=""
                class="input-group input-group-append"
                data-cy="time-slider-dropdown"
                @submit.prevent
            >
                <GeoadminTooltip
                    ref="errorTooltip"
                    :tooltip-content="tooltipContent"
                    placement="bottom"
                    theme="danger"
                    open-trigger="manual"
                >
                    <input
                        ref="input"
                        :value="displayEntry"
                        class="form-control rounded-end-0"
                        :class="{ 'rounded-bottom-0': isDropdownOpen }"
                        data-cy="time-slider-dropdown-input"
                        @input="inputValue = $event.target.value"
                        @focusin="openList"
                        @focusout="onFocusOut"
                        @keydown.esc.prevent="closeList"
                        @keydown.down.prevent="focusSearchlist"
                        @keydown.enter.prevent="onEnter"
                    />
                </GeoadminTooltip>

                <div class="input-group-append btn-group">
                    <button
                        class="btn border btn-outline-group d-flex align-items-center rounded-start-0 rounded-end-0"
                        :class="{
                            'url-input-dropdown-open': isDropdownOpen,
                        }"
                        type="button"
                        @click="toggleList"
                    >
                        <FontAwesomeIcon
                            :icon="isDropdownOpen ? 'caret-up' : 'caret-down'"
                            size="lg"
                        />
                    </button>
                    <button
                        data-cy="time-slider-play-button"
                        class="btn btn-outline-group d-flex align-items-center px-3 border rounded-start-0"
                        :class="{ 'rounded-bottom-0': isDropdownOpen }"
                        @click="emit('play')"
                    >
                        <FontAwesomeIcon
                            :icon="isPlaying ? 'pause' : 'play'"
                            size="sm"
                        />
                    </button>
                </div>
            </form>
        </div>
        <TimeSliderDropdownList
            ref="searchList"
            :entries="dropdownEntries"
            :show-list="isDropdownOpen"
            @choose-entry="chooseEntry"
            @hide="isDropdownOpen = false"
        />
    </div>
</template>
