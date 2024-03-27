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
    dropdownMenu: {
        type: Boolean,
        default: false,
    },
})
const { isSelected, title, tooltip } = toRefs(props)

const emit = defineEmits(['toggleMenu'])

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
    <div class="advanced-tools-item border-bottom">
        <a
            class="d-flex align-items-center advanced-tools-title text-decoration-none ps-2"
            :class="{ 'text-primary': isSelected, 'text-black': !isSelected }"
            :data-cy="`menu-advanced-tools-${title}`"
            @click="emit('toggleMenu')"
        >
            <FontAwesomeIcon
                class="btn border-0 px-2"
                :class="{ invisible: !dropdownMenu, 'text-primary': isSelected }"
                :icon="`caret-${isSelected ? 'down' : 'right'}`"
            />
            <span ref="tippyTooltip" class="px-1">{{ i18n.t(title) }} </span>
        </a>
        <slot />
    </div>
</template>

<style lang="scss" scoped>
@import 'src/scss/webmapviewer-bootstrap-theme';
@import 'src/modules/menu/scss/menu-items';
.advanced-tools-item {
    .advanced-tools-title {
        // Here we add the menu-item styling to the title only to avoid hover
        // on the content once the item has been opened
        @extend .menu-item;

        cursor: pointer;
        height: 2.75em;
        line-height: 2.75em;
    }
}
</style>
