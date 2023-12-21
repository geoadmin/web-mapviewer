<script setup>
import tippy from 'tippy.js'
import { computed, onBeforeUnmount, onMounted, ref, toRefs, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useStore } from 'vuex'

const props = defineProps({
    compact: {
        type: Boolean,
        required: true,
    },
    errorMessage: {
        type: String,
        required: true,
    },
})
const { compact, errorMessage } = toRefs(props)
const errorButton = ref(null)

const i18n = useI18n()
const store = useStore()

const lang = computed(() => store.state.i18n.lang)

let tippyInstance = null

watch(lang, () => tippyInstance?.setContent(i18n.t(errorMessage.value)))

onMounted(() => {
    tippyInstance = tippy(errorButton.value, {
        theme: 'danger',
        content: i18n.t(errorMessage.value),
        arrow: true,
        placement: 'top',
        touch: false,
        hideOnClick: false,
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
            class="btn text-danger border-0 p-0"
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
