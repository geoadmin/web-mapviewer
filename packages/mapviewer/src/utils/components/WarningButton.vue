<script setup>
import tippy from 'tippy.js'
import { computed, onBeforeUnmount, onMounted, ref, toRefs, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useStore } from 'vuex'

import WarningMessage from '@/utils/WarningMessage.class'

const props = defineProps({
    compact: {
        type: Boolean,
        required: true,
    },
    warningMessage: {
        type: WarningMessage,
        required: true,
    },
})
const { compact, warningMessage } = toRefs(props)
const warningButton = ref(null)

const i18n = useI18n()
const store = useStore()

const lang = computed(() => store.state.i18n.lang)
const translatedMessage = computed(() =>
    i18n.t(warningMessage.value.msg, warningMessage.value.params)
)

let tippyInstance = null

watch(lang, () => tippyInstance?.setContent(translatedMessage.value))

onMounted(() => {
    tippyInstance = tippy(warningButton.value, {
        theme: 'warning',
        content: translatedMessage.value,
        arrow: true,
        placement: 'top',
        touch: false,
        hideOnClick: false,
        onCreate: (instance) => {
            const dataCy = instance.reference.getAttribute('data-cy')
            if (dataCy) {
                instance.popper.setAttribute('data-cy', `tippy-${dataCy}`)
            }
        },
    })
})

onBeforeUnmount(() => {
    tippyInstance?.destroy()
    tippyInstance = null
})
</script>

<template>
    <div ref="warningButton">
        <button
            class="btn text-warning border-0 p-1 d-flex align-items-center"
            :class="{
                'btn-lg': !compact,
            }"
            disabled
            aria-disabled="true"
            tabindex="-1"
            :data-cy="`button-has-warning`"
        >
            <FontAwesomeIcon icon="triangle-exclamation" />
        </button>
    </div>
</template>

<style lang="scss" scoped></style>
