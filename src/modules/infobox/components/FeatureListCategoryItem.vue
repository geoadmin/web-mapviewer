<script setup>
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { computed, nextTick, ref, toRefs } from 'vue'
import { useStore } from 'vuex'

import EditableFeature from '@/api/features/EditableFeature.class'
import LayerFeature from '@/api/features/LayerFeature.class'
import FeatureDetail from '@/modules/infobox/components/FeatureDetail.vue'
import ShowGeometryProfileButton from '@/modules/infobox/components/ShowGeometryProfileButton.vue'
import { canFeatureShowProfile } from '@/store/modules/features.store.js'
import { FeatureInfoPositions } from '@/store/modules/ui.store.js'
import ZoomToExtentButton from '@/utils/ZoomToExtentButton.vue'

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

const canDisplayProfile = computed(() => canFeatureShowProfile(item.value))

const store = useStore()
const isHighlightedFeature = computed(
    () => store.state.features.highlightedFeatureId === item.value.id
)
const selectedFeaturesCount = computed(() => store.getters.selectedFeatures?.length)

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

function forceFeatureInfoAtBottom() {
    store.dispatch('setFeatureInfoPosition', {
        position: FeatureInfoPositions.BOTTOMPANEL,
        ...dispatcher,
    })
}

function onShowProfile(event) {
    setShowContent(true, event, false)
    // as the profile will be stored at the bottom of the screen, we do not want to have
    // a floating tooltip while some information are at the bottom, so we force the tooltip down
    forceFeatureInfoAtBottom()
}

function onZoomToExtent(event) {
    showContentAndScrollIntoView(event)
    // if more than one feature are currently selected, we can't be sure the new extent of the map will
    // contain all of them, so we switch the feature list to be at the bottom of the screen
    if (selectedFeaturesCount.value > 0) {
        forceFeatureInfoAtBottom()
    }
}
</script>

<template>
    <div
        class="feature-list-category-item-name p-2 align-middle position-relative"
        :class="{ highlighted: isHighlightedFeature, 'border-bottom': !showContent }"
        @click="toggleShowContent"
        @mouseenter.passive="highlightFeature(item)"
        @mouseleave.passive="clearHighlightedFeature"
    >
        <FontAwesomeIcon :icon="`caret-${showContent ? 'down' : 'right'}`" class="mx-2" />
        <strong>{{ name }}</strong>

        <ZoomToExtentButton
            v-if="item.extent"
            :extent="item.extent"
            class="float-end"
            @click="onZoomToExtent"
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
            <ShowGeometryProfileButton :feature="item" @click="onShowProfile" />
        </div>
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
