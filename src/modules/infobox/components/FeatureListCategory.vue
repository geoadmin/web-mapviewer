<script setup>
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { ref, toRefs } from 'vue'
import { useI18n } from 'vue-i18n'

import EditableFeature from '@/api/features/EditableFeature.class'
import LayerFeature from '@/api/features/LayerFeature.class'
import FeatureListCategoryItem from '@/modules/infobox/components/FeatureListCategoryItem.vue'

const props = defineProps({
    name: {
        type: String,
        required: true,
    },
    children: {
        type: Array,
        required: true,
        validator: (value) =>
            Array.isArray(value) &&
            value.some((item) => item instanceof LayerFeature || item instanceof EditableFeature),
    },
    canLoadMore: {
        type: Boolean,
        default: false,
    },
})

const { name, children, canLoadMore } = toRefs(props)

const emits = defineEmits(['loadMoreResults'])

const showContent = ref(true)

const { t } = useI18n()
</script>

<template>
    <div class="feature-list-category border-start">
        <div
            class="p-2 sticky-top bg-secondary-subtle border-bottom border-secondary-subtle d-flex align-items-center cursor-pointer"
            @click="showContent = !showContent"
        >
            <FontAwesomeIcon :icon="`caret-${showContent ? 'down' : 'right'}`" class="me-2" />
            <strong class="flex-grow-1">{{ name }}</strong>
            <small class="text-muted">
                {{ children.length }}<span v-if="canLoadMore">+</span>
            </small>
        </div>
        <div v-if="showContent" class="feature-list-category-children">
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
                    class="btn btn-sm btn-secondary flex-grow-1"
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
