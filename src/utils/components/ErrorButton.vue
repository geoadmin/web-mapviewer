<script setup>
import tippy from 'tippy.js'
import { computed, onBeforeUnmount, onMounted, ref, toRefs, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useStore } from 'vuex'

import ErrorMessage from '@/utils/ErrorMessage.class'

const props = defineProps({
    compact: {
        type: Boolean,
        required: true,
    },
    errorMessage: {
        type: ErrorMessage,
        required: true,
    },
})
const { compact, errorMessage } = toRefs(props)
const errorButton = ref(null)

const i18n = useI18n()
const store = useStore()

const lang = computed(() => store.state.i18n.lang)
const translatedMessage = computed(() => i18n.t(errorMessage.value.msg, errorMessage.value.params))

let tippyInstance = null

watch(lang, () => tippyInstance?.setContent(translatedMessage.value))

onMounted(() => {
    tippyInstance = tippy(errorButton.value, {
        theme: 'danger',
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
    <div ref="errorButton">
        <button
            class="btn text-danger border-0 p-0 d-flex align-items-center"
            :class="{
                'btn-lg': !compact,
            }"
            disabled
            aria-disabled="true"
            tabindex="-1"
            :data-cy="`button-has-error`"
        >
            <FontAwesomeIcon icon="circle-exclamation" />
        </button>
    </div>
</template>

<style lang="scss" scoped></style>
