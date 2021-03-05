<template>
    <ModalWithOverlay :title="$t('metadata_window_title')" :allow-print="true" @close="onClose">
        <div class="layer-legend">
            <h4 v-if="!content" class="mb-0">
                <font-awesome-icon spin :icon="['fa', 'spinner']" />
            </h4>
            <!-- eslint-disable vue/no-v-html-->
            <div v-else data-cy="layer-legend" v-html="content"></div>
            <!-- eslint-enable vue/no-v-html-->
        </div>
    </ModalWithOverlay>
</template>

<script>
import ModalWithOverlay from '@/modules/overlay/components/ModalWithOverlay'
import { getLayerLegend } from '@/api/layers.api'

export default {
    components: { ModalWithOverlay },
    props: {
        layerId: {
            type: String,
            required: true,
        },
    },
    data() {
        return {
            content: null,
        }
    },
    mounted() {
        getLayerLegend(this.$i18n.lang, this.layerId).then((layerLegend) => {
            this.content = layerLegend
        })
    },
    methods: {
        onClose: function () {
            this.$emit('close', this.layerId)
        },
    },
}
</script>

<style lang="scss">
@import 'src/scss/variables';
.layer-legend {
    font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
    font-style: normal;
    font-weight: 400;
    font-size: 12px;
    line-height: 1.42857143;
    line-break: auto;
    text-align: start;
    .legend-header {
        background-color: #eee;
        padding: 8px;
        .bod-title {
            color: red;
        }
    }
    .legend-footer {
        padding: 8px;
        span {
            font-weight: 700;
        }
        table {
            font-size: 100%;
            width: 100%;
            border: 0;
        }
    }
}
</style>
