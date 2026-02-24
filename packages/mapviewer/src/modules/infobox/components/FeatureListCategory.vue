<script setup lang="ts">
import type { EditableFeature, LayerFeature } from '@swissgeo/api'

import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'

import FeatureListCategoryItem from '@/modules/infobox/components/FeatureListCategoryItem.vue'

const { name, children, canLoadMore } = defineProps<{
    name: string
    children: Array<LayerFeature | EditableFeature>
    canLoadMore: boolean
}>()

const emits = defineEmits<{
    loadMoreResults: [void]
}>()

const showContent = ref<boolean>(true)

const { t } = useI18n()
</script>

<template>
    <div class="feature-list-category border-start">
        <div
            class="sticky-top bg-secondary-subtle border-bottom border-secondary-subtle d-flex align-items-center cursor-pointer p-2"
            @click="showContent = !showContent"
        >
            <FontAwesomeIcon
                :icon="`caret-${showContent ? 'down' : 'right'}`"
                class="me-2"
            />
            <span class="flex-grow-1">
                <strong
                    v-if="name"
                    data-cy="feature-list-category-title"
                >
                    {{ t(name) }}
                </strong>
            </span>
            <small class="text-muted">
                {{ children.length }}
                <span v-if="canLoadMore">+</span>
            </small>
        </div>
        <div
            v-if="showContent"
            class="feature-list-category-children"
        >
            <FeatureListCategoryItem
                v-for="(child, index) in children"
                :key="child.id"
                :name="child.title"
                :item="child"
                :show-content-by-default="index === 0"
            />
            <div class="d-flex p-1">
                <button
                    v-if="canLoadMore"
                    class="btn btn-sm btn-secondary no-print flex-grow-1"
                    data-cy="feature-list-load-more"
                    @click="emits('loadMoreResults')"
                >
                    {{ t('show_more_results') }}
                </button>
            </div>
        </div>
    </div>
</template>

<style lang="scss" scoped>
.feature-list-category {
    font-size: 0.8rem;
}
</style>
