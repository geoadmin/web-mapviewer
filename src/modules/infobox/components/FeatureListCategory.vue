<script setup>
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { ref, toRefs } from 'vue'

import EditableFeature from '@/api/features/EditableFeature.class.js'
import LayerFeature from '@/api/features/LayerFeature.class.js'
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
})

const { name, children } = toRefs(props)

const showContent = ref(true)
</script>

<template>
    <div class="feature-list-category border-start">
        <div
            class="feature-list-category-title p-2 sticky-top bg-secondary-subtle border-bottom border-secondary-subtle d-flex"
            @click="showContent = !showContent"
        >
            <FontAwesomeIcon :icon="`caret-${showContent ? 'down' : 'right'}`" class="me-1" />
            <strong>{{ name }}</strong>
        </div>
        <div v-if="showContent" class="feature-list-category-children">
            <FeatureListCategoryItem
                v-for="(child, index) in children"
                :key="child.id"
                :name="child.title"
                :item="child"
                :show-content-by-default="index === 0"
            />
        </div>
    </div>
</template>

<style lang="scss" scoped>
@import 'src/scss/variables-admin.module';

.feature-list-category {
    font-size: 0.8rem;
}
</style>