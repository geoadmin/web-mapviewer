<script setup>
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { computed, nextTick, ref, toRefs } from 'vue'
import { useStore } from 'vuex'

import EditableFeature from '@/api/features/EditableFeature.class.js'
import LayerFeature from '@/api/features/LayerFeature.class.js'
import FeatureDetail from '@/modules/infobox/components/FeatureDetail.vue'
import { normalizeExtent } from '@/utils/coordinates/coordinateUtils.js'

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
const showContent = ref(!!showContentByDefault.value)

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

function showContentAndScrollIntoView() {
    showContent.value = true
    nextTick(() => {
        content.value?.scrollIntoView({ behavior: 'smooth', block: 'end' })
    })
}

function zoomToFeatureExtent(event) {
    event.preventDefault()
    event.stopImmediatePropagation()
    // showing content if it was hidden
    if (!showContent.value) {
        showContentAndScrollIntoView()
    }
    store.dispatch('zoomToExtent', {
        extent: normalizeExtent(item.value.extent),
        ...dispatcher,
    })
    return false
}
</script>

<template>
    <div
        class="feature-list-category-item-name p-2 align-middle position-relative"
        :class="{ highlighted: isHighlightedFeature, 'border-bottom': !showContent }"
        @click.passive="toggleShowContent"
        @mouseenter.passive="highlightFeature(item)"
        @mouseleave.passive="clearHighlightedFeature"
    >
        <FontAwesomeIcon :icon="`caret-${showContent ? 'down' : 'right'}`" class="mx-1" />
        <strong>{{ name }}</strong>
        <button
            class="btn btn-xs text-secondary position-absolute end-0 me-2"
            @click.prevent="zoomToFeatureExtent"
        >
            <FontAwesomeIcon v-if="item.extent" icon="fa-search-plus" class="float-end" />
        </button>
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
    </div>
</template>

<style lang="scss" scoped>
@import 'src/scss/variables-admin.module';

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