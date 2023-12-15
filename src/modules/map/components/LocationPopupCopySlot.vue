<script setup>
import tippy from 'tippy.js'
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useStore } from 'vuex'

import log from '@/utils/logging'

const { identifier, value, extraValue, resetDelay } = defineProps({
    identifier: {
        type: String,
        required: true,
    },
    value: {
        type: String,
        required: true,
    },
    extraValue: {
        type: String,
        default: null,
    },
    resetDelay: {
        type: Number,
        default: 1000,
    },
})

const copyButton = ref(null)
const copied = ref(false)

const i18n = useI18n()

const store = useStore()
const lang = computed(() => store.state.i18n.lang)

const buttonIcon = computed(() => {
    if (copied.value) {
        return 'check'
    }
    // as copy is part of the "Regular" icon set, we have to give the 'far' identifier
    return ['far', 'copy']
})

let copyTooltip = null

onMounted(() => {
    copyTooltip = tippy(copyButton.value, {
        arrow: true,
        placement: 'right',
        hideOnClick: false,
        // no tooltip on mobile/touch
        touch: false,
    })
    setTooltipContent()
})
onBeforeUnmount(() => {
    copyTooltip.destroy()
})

watch(lang, setTooltipContent)
watch(copied, setTooltipContent)

function setTooltipContent() {
    if (copied.value) {
        copyTooltip.setContent(i18n.t('copy_done'))
    } else {
        copyTooltip.setContent(i18n.t('copy_cta'))
    }
}
async function copyValue() {
    try {
        await navigator.clipboard.writeText(value)
        copied.value = true
        // leaving the "Copied" text for the wanted delay, and then reverting to "Copy"
        setTimeout(() => {
            copied.value = false
        }, resetDelay)
    } catch (error) {
        log.error(`Failed to copy to clipboard:`, error)
    }
}
</script>

<template>
    <div class="location-popup-label">
        <slot />
    </div>
    <div class="location-popup-data">
        <div :data-cy="`location-popup-${identifier}`">
            {{ value }}
            <div v-if="extraValue">
                {{ extraValue }}
            </div>
        </div>
        <button
            ref="copyButton"
            class="location-popup-copy-button btn btn-light text-black-50 d-none d-md-block"
            type="button"
            @click="copyValue"
        >
            <FontAwesomeIcon class="icon" :icon="buttonIcon" />
        </button>
    </div>
</template>

<style lang="scss" scoped>
@import 'src/scss/webmapviewer-bootstrap-theme';
.location-popup-data {
    display: grid;
    grid-template-columns: auto max-content;
}
.location-popup-copy-button {
    // aligning to the top of the container, so that it doesn't spread down if there's an extra value
    align-self: start;
    margin-top: -0.1rem;
    padding: 0 0.2rem;
    font-size: inherit;
}
</style>
