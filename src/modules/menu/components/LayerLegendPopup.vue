<template>
    <ModalWithBackdrop :title="$t('metadata_window_title')" :allow-print="true" @close="onClose">
        <div class="layer-legend" data-cy="layer-legend-popup">
            <h4 v-if="!content" class="mb-0">
                <font-awesome-icon spin :icon="['fa', 'spinner']" />
            </h4>
            <!-- eslint-disable vue/no-v-html-->
            <div v-else data-cy="layer-legend" v-html="content"></div>
            <!-- eslint-enable vue/no-v-html-->
        </div>
    </ModalWithBackdrop>
</template>

<script>
import { getLayerLegend } from '@/api/layers/layers.api'
import ModalWithBackdrop from '@/utils/ModalWithBackdrop.vue'

export default {
    components: { ModalWithBackdrop },
    props: {
        layerId: {
            type: String,
            required: true,
        },
    },
    emits: ['close'],
    data() {
        return {
            content: null,
        }
    },
    async mounted() {
        this.content = await getLayerLegend(this.$i18n.lang, this.layerId)
    },
    methods: {
        onClose() {
            this.$emit('close', this.layerId)
        },
    },
}
</script>

<style lang="scss">
// No scoping here as we need to apply styles to the markup we included with v-html.
@import 'src/scss/variables';
$spacing: 8px;

.layer-legend {
    font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
    font-style: normal;
    font-weight: 400;
    font-size: 12px;
    line-height: 1.42857143;
    line-break: auto;
    text-align: start;
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
        color: red;
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
        width: 100%;
        border: 0;
    }
}
</style>
