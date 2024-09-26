<script setup>
import { computed, onMounted, ref, toRefs, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useStore } from 'vuex'

import AbstractLayer from '@/api/layers/AbstractLayer.class'
import { getLayerDescription } from '@/api/layers/layers.api'
import ModalWithBackdrop from '@/utils/components/ModalWithBackdrop.vue'

const props = defineProps({
    layer: {
        type: AbstractLayer || null,
        default: null,
    },
    layerId: {
        type: String || null,
        default: null,
    },
    layerName: {
        type: String || null,
        default: null,
    },
})
const emit = defineEmits(['close'])
const store = useStore()
const i18n = useI18n()

const { layer, layerId, layerName } = toRefs(props)
const htmlContent = ref('')

const currentLang = computed(() => store.state.i18n.lang)
const title = computed(() => layer.value?.name ?? layerName.value)
const body = computed(() => layer.value?.abstract ?? '')

const attributionName = computed(() => layer.value?.attributions[0].name ?? '')
const attributionUrl = computed(() => layer.value?.attributions[0].url ?? '')
const isExternal = computed(() => layer.value?.isExternal ?? false)

const legends = computed(() => layer.value?.legends ?? [])
watch(layer, async (newLayer) => {
    if (!isExternal.value && layer.value) {
        htmlContent.value = await getLayerDescription(currentLang.value, newLayer.id)
    }
})

watch(layerId, async (newLayerId) => {
    if (!isExternal.value && layerId.value) {
        htmlContent.value = await getLayerDescription(currentLang.value, newLayerId)
    }
})

onMounted(async () => {
    if (!isExternal.value && layer.value) {
        htmlContent.value = await getLayerDescription(currentLang.value, layer.value.id)
    } else if (!isExternal.value && layerId.value) {
        htmlContent.value = await getLayerDescription(currentLang.value, layerId.value)
    }
})
</script>

<template>
    <ModalWithBackdrop
        :title="title"
        :allow-print="true"
        :movable="true"
        @close="emit('close', layerId)"
    >
        <div class="layer-description" data-cy="layer-description-popup">
            <h4 v-if="!isExternal && !htmlContent" class="mb-0">
                <font-awesome-icon spin :icon="['fa', 'spinner']" />
            </h4>
            <div v-else-if="isExternal">
                <h6 v-if="body" data-cy="layer-description-popup-description-title">
                    {{ i18n.t('description') }}
                </h6>
                <div v-if="body" data-cy="layer-description-popup-description-body">{{ body }}</div>
                <div v-if="legends.length" class="mt-4">
                    <h6 data-cy="layer-description-popup-legends-title">{{ i18n.t('legend') }}</h6>
                    <div
                        v-for="legend in legends"
                        :key="legend.url"
                        :data-cy="`layer-description-popup-legends-body-${legend.url}`"
                    >
                        <img v-if="legend.format.startsWith('image/')" :src="legend.url" />
                        <iframe v-else-if="legend.format === 'text/html'" :src="legend.url" />
                        <a v-else :href="legend.url" target="_blank">{{ legend.url }}</a>
                    </div>
                </div>

                <div
                    class="mt-2 text-primary text-end"
                    data-cy="layer-description-popup-attributions"
                >
                    <span class="me-1">{{ i18n.t('copyright_data') }}</span>
                    <a v-if="attributionUrl" :href="attributionUrl" target="_blank">{{
                        attributionName
                    }}</a>
                    <span v-else>{{ attributionName }}</span>
                </div>
            </div>
            <!-- eslint-disable vue/no-v-html-->
            <div v-else data-cy="layer-description" v-html="htmlContent"></div>
            <!-- eslint-enable vue/no-v-html-->
        </div>
    </ModalWithBackdrop>
</template>

<style lang="scss">
// No scoping here as we need to apply styles to the markup we included with v-html.
@import '@/scss/variables.module';
@import '@/scss/webmapviewer-bootstrap-theme';

$spacing: 8px;

.layer-description {
    font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
    font-style: normal;
    font-weight: 400;
    font-size: 12px;
    line-height: 1.42857143;
    line-break: auto;
    text-align: start;

    // allow user selection
    @extend .clear-no-ios-long-press;
}

.legend-header {
    // Negative margin to overcome padding from the parent.
    // Removing the padding from the parent and adding the spacing on all
    // possible child elements would be a mess.
    margin: -0.5rem;
    margin-bottom: 0;

    padding: $spacing;
    background-color: #eee;
    .bod-title {
        color: $primary;
        margin-bottom: $spacing;
    }
    .legend-abstract {
        margin-bottom: 0;
    }
}

.legend-footer {
    padding: $spacing;
    span {
        font-weight: 700;
    }
    table {
        font-size: 100%;
        width: fit-content;
        border: 0;
    }
    td {
        padding-right: 2rem;
    }
}
</style>
