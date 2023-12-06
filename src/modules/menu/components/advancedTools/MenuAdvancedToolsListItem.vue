<script setup>
import tippy from 'tippy.js'
import { computed, onMounted, onUnmounted, ref, toRefs, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useStore } from 'vuex'

const props = defineProps({
    isSelected: {
        type: Boolean,
        default: false,
    },
    title: {
        type: String,
        required: true,
    },
    tooltip: {
        type: String,
        default: '',
    },
})
const { isSelected, title, tooltip } = toRefs(props)
const tippyTooltip = ref(null)
let tippyInstance = null

const i18n = useI18n()
const store = useStore()

const currentLocal = computed(() => store.state.i18n.lang)

watch(currentLocal, () => {
    tippyInstance.setContent(i18n.t(tooltip.value))
})

onMounted(() => {
    tippyInstance = tippy(tippyTooltip.value, {
        content: i18n.t(tooltip.value),
        arrow: true,
        placement: 'auto',
        touch: false,
        delay: 500,
    })
})

onUnmounted(() => {
    tippyInstance?.destroy()
})
</script>

<template>
    <li class="advanced-tools-item">
        <a
            class="advanced-tools-title"
            :class="{ 'text-primary': isSelected }"
            :data-cy="`menu-advanced-tools-${title}`"
        >
            <span ref="tippyTooltip" class="pe-1">{{ i18n.t(title) }} </span>
        </a>
        <slot />
    </li>
</template>

<style lang="scss" scoped>
.advanced-tools-item {
    .advanced-tools-title {
        display: block;
        color: black;
        text-decoration: none;
        cursor: pointer;
        border-bottom-width: 1px;
        border-bottom-style: solid;
        border-bottom-color: #e9e9e9;
        height: 2.75em;
        line-height: 2.75em;
    }
    .advanced-tools-title:hover,
    .advanced-tools-title:focus {
        color: #666;
    }
}
</style>
