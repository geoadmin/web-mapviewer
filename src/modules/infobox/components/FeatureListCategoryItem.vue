<script setup>
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { computed, nextTick, ref, toRefs } from 'vue'
import { useStore } from 'vuex'

import EditableFeature from '@/api/features/EditableFeature.class'
import LayerFeature from '@/api/features/LayerFeature.class'
import FeatureDetail from '@/modules/infobox/components/FeatureDetail.vue'
import ShowGeometryProfileButton from '@/modules/infobox/components/ShowGeometryProfileButton.vue'
import { canFeatureShowProfile } from '@/store/modules/features.store'
import TextTruncate from '@/utils/components/TextTruncate.vue'
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
</script>

<template>
    <div
        ref="featureTitle"
        class="feature-list-category-item-name p-1 d-flex align-items-center cursor-pointer"
        :class="{
            highlighted: isHighlightedFeature,
            'border-bottom': !showContent,
        }"
        data-cy="feature-item"
        @click="toggleShowContent"
        @mouseenter.passive="highlightFeature(item)"
        @mouseleave.passive="clearHighlightedFeature"
    >
        <FontAwesomeIcon :icon="`caret-${showContent ? 'down' : 'right'}`" class="mx-2" />
        <TextTruncate :text="name" class="flex-grow-1">
            <strong>{{ name }}</strong>
        </TextTruncate>

        <ZoomToExtentButton
            v-if="item.extent"
            :extent="item.extent"
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
@import '@/scss/webmapviewer-bootstrap-theme';

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
