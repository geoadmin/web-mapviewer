<script setup>
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import tippy from 'tippy.js'
import { computed, nextTick, ref, toRefs } from 'vue'
import { onMounted } from 'vue'
import { onUnmounted } from 'vue'
import { useStore } from 'vuex'

import EditableFeature from '@/api/features/EditableFeature.class'
import LayerFeature from '@/api/features/LayerFeature.class'
import FeatureDetail from '@/modules/infobox/components/FeatureDetail.vue'
import ShowGeometryProfileButton from '@/modules/infobox/components/ShowGeometryProfileButton.vue'
import { canFeatureShowProfile } from '@/store/modules/features.store'
import ZoomToExtentButton from '@/utils/components/ZoomToExtentButton.vue'

const dispatcher = { dispatcher: 'FeatureListCategoryItem.vue' }

const props = defineProps({
    name: {
        type: String,
        required: true,
    },
    item: {
        type: [EditableFeature, LayerFeature],
        required: true,
    },
    showContentByDefault: {
        type: Boolean,
        default: false,
    },
})

const { name, item, showContentByDefault } = toRefs(props)

const content = ref(null)
const featureTitle = ref(null)
const showContent = ref(!!showContentByDefault.value)
let tippyTitle = null

const canDisplayProfile = computed(() => canFeatureShowProfile(item.value))

const store = useStore()
const isHighlightedFeature = computed(
    () => store.state.features.highlightedFeatureId === item.value.id
)

function highlightFeature(feature) {
    store.dispatch('setHighlightedFeatureId', {
        highlightedFeatureId: feature?.id,
        ...dispatcher,
    })
}
function clearHighlightedFeature() {
    store.dispatch('setHighlightedFeatureId', {
        highlightedFeatureId: null,
        ...dispatcher,
    })
}

function toggleShowContent() {
    if (!showContent.value) {
        showContentAndScrollIntoView()
    } else {
        showContent.value = false
    }
}

function showContentAndScrollIntoView(event) {
    showContent.value = true
    nextTick(() => {
        content.value?.scrollIntoView({ behavior: 'smooth', block: 'end' })
    })
    // if coming from the profile or zoom-to-extent button, we want to stop the event
    // so that it doesn't bubble up to the parent div (which will trigger a toggleShowContent
    // and toggle back off the container below)
    if (event) {
        event.preventDefault()
        event.stopPropagation()
        return false
    }
}

onMounted(() => {
    // there is no easy way to see if a item is truncated by css, so we
    // check if the offset width is smaller than the scroll width.
    // when there is a truncate, the offset changes but not the scroll, which
    // means we can use that to detect truncating.
    // this might be a bit hacky, but it works :)
    if (featureTitle.value.offsetWidth < featureTitle.value.scrollWidth) {
        tippyTitle = tippy(featureTitle.value, {
            content: name.value,
            hideOnClick: true,
            placement: 'top',
            delay: [500],
            // Show tippy on long touch for mobile device
            touch: ['hold', 500], // 500ms delay,
        })
    }
})
onUnmounted(() => {
    tippyTitle?.destroy()
})
</script>

<template>
    <div
        ref="featureTitle"
        class="feature-list-category-item-name p-2 align-middle position-relative cursor-pointer text-truncate"
        :class="{ highlighted: isHighlightedFeature, 'border-bottom': !showContent }"
        data-cy="feature-item"
        @click="toggleShowContent"
        @mouseenter.passive="highlightFeature(item)"
        @mouseleave.passive="clearHighlightedFeature"
    >
        <FontAwesomeIcon :icon="`caret-${showContent ? 'down' : 'right'}`" class="mx-2" />
        <strong>
            {{ name }}
        </strong>

        <ZoomToExtentButton
            v-if="item.extent"
            :extent="item.extent"
            class="float-end"
            @click="showContentAndScrollIntoView"
        />
    </div>
    <div
        v-if="showContent"
        ref="content"
        class="feature-list-category-item-content border-bottom h-100"
        :class="{ highlighted: isHighlightedFeature }"
        @mouseenter.passive="highlightFeature(item)"
        @mouseleave.passive="clearHighlightedFeature"
    >
        <FeatureDetail :feature="item" />
        <div v-if="canDisplayProfile" class="d-grid p-1">
            <ShowGeometryProfileButton :feature="item" @click="showContentAndScrollIntoView" />
        </div>
    </div>
</template>

<style lang="scss" scoped>
@import '@/scss/variables-admin.module';

.feature-list-category-item-name {
    &.highlighted {
        background-color: rgba($mocassin-to-red-1, 0.8);
    }
}
.feature-list-category-item-content {
    &.highlighted {
        box-shadow: inset 0 0 0 2px rgba($mocassin-to-red-1, 0.8);
    }
}
</style>
