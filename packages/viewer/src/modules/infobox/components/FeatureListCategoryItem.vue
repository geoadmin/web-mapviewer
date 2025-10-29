<script setup lang="ts">
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import log, { LogPreDefinedColor } from '@swissgeo/log'
import { computed, nextTick, ref, useTemplateRef } from 'vue'

import type { EditableFeature, LayerFeature } from '@/api/features.api'
import type { ActionDispatcher } from '@/store/types'

import FeatureDetail from '@/modules/infobox/components/FeatureDetail.vue'
import ShowGeometryProfileButton from '@/modules/infobox/components/ShowGeometryProfileButton.vue'
import useFeaturesStore from '@/store/modules/features'
import { canFeatureShowProfile } from '@/store/modules/profile/utils/canFeatureShowProfile'
import TextTruncate from '@/utils/components/TextTruncate.vue'
import ZoomToExtentButton from '@/utils/components/ZoomToExtentButton.vue'

const dispatcher: ActionDispatcher = { name: 'FeatureListCategoryItem.vue' }

const {
    name,
    item,
    showContentByDefault = false,
} = defineProps<{
    name: string | number
    item: EditableFeature | LayerFeature
    showContentByDefault?: boolean
}>()

const contentRef = useTemplateRef<HTMLDivElement>('content')
const featureTitleRef = useTemplateRef<HTMLDivElement>('featureTitle')
const showContent = ref<boolean>(showContentByDefault)
const canDisplayProfile = computed<boolean>(() => canFeatureShowProfile(item))

const featuresStore = useFeaturesStore()
const isHighlightedFeature = computed<boolean>(() => featuresStore.highlightedFeatureId === item.id)

function highlightFeature(feature: EditableFeature | LayerFeature): void {
    featuresStore.setHighlightedFeatureId(feature?.id.toString(), dispatcher)
}

function clearHighlightedFeature(): void {
    featuresStore.setHighlightedFeatureId(undefined, dispatcher)
}

function toggleShowContent() {
    if (!showContent.value) {
        showContentAndScrollIntoView()
    } else {
        showContent.value = false
    }
}

function showContentAndScrollIntoView(event?: MouseEvent): void {
    showContent.value = true
    nextTick(() => {
        contentRef.value?.scrollIntoView({ behavior: 'smooth', block: 'end' })
    }).catch((err) => {
        log.error({
            title: 'FeatureListCategoryItem.vue',
            titleColor: LogPreDefinedColor.Red,
            message: ['Error while waiting for the next tick to scroll the content into view', err],
        })
    })
    // if coming from the profile or zoom-to-extent button, we want to stop the event
    // so that it doesn't bubble up to the parent div (which will trigger a toggleShowContent
    // and toggle back off the container below)
    if (event) {
        event.preventDefault()
        event.stopPropagation()
        return
    }
}
</script>

<template>
    <div
        ref="featureTitleRef"
        class="feature-list-category-item-name d-flex align-items-center cursor-pointer p-1"
        :class="{
            highlighted: isHighlightedFeature,
            'border-bottom': !showContent,
        }"
        data-cy="feature-item"
        @click="toggleShowContent"
        @mouseenter.passive="highlightFeature(item)"
        @mouseleave.passive="clearHighlightedFeature"
    >
        <FontAwesomeIcon
            :icon="`caret-${showContent ? 'down' : 'right'}`"
            class="mx-2"
        />
        <TextTruncate
            :text="`${name}`"
            class="flex-grow-1"
        >
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
        ref="contentRef"
        class="feature-list-category-item-content border-bottom h-100"
        :class="{ highlighted: isHighlightedFeature }"
        @mouseenter.passive="highlightFeature(item)"
        @mouseleave.passive="clearHighlightedFeature"
    >
        <FeatureDetail :feature="item" />
        <div
            v-if="canDisplayProfile"
            class="d-grid p-1"
        >
            <ShowGeometryProfileButton
                :feature="item"
                @click="showContentAndScrollIntoView"
            />
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
