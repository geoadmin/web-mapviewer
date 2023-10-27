<template>
    <div class="d-flex flex-column results-list-container">
        <div v-if="maxSize">
            {{ $t('wms_max_size_allowed') }} {{ maxSize.width }} * {{ maxSize.height }}
        </div>
        <div class="results-container gap-4">
            <div class="flex-grow-1 results-table-container">
                <div class="d-flex justify-content-between align-items-center results-header">
                    <div></div>
                    <div>{{ $t('title') }}</div>
                    <div>
                        <button class="btn" @click="toggleSort">
                            <FontAwesomeIcon
                                :icon="
                                    revertSort
                                        ? ['fas', 'sort-alpha-up']
                                        : ['fas', 'sort-alpha-down']
                                "
                            />
                        </button>
                    </div>
                </div>
                <div class="results-list overflow-y-auto">
                    <ImportContentResultItem
                        v-for="(layer, index) in sortedList"
                        :key="`${index}-${layer.externalLayerId}`"
                        :item="layer"
                        :highlight-id="selectedLayer?.externalLayerId"
                        class="list-item"
                        :class="{
                            odd: (index + 1) % 2,
                        }"
                        @click-on-item="onItemClick"
                        @preview-start="onPreviewStart"
                        @preview-stop="onPreviewStop"
                    />
                </div>
            </div>
            <div class="d-flex flex-column flex-grow-1 description-container">
                <span class="description-title">{{ $t('description') }}</span>
                <textarea class="description-text" :value="description" readonly></textarea>
                <div
                    class="add-btn-container mb-2"
                    :class="{
                        disabled: !selectedLayer,
                    }"
                >
                    <button
                        type="button"
                        class="btn btn-outline-secondary add-btn mt-1 w-100"
                        :disabled="!selectedLayer"
                        @click="onAddLayer"
                    >
                        {{ $t('add_layer') }}
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import { mapActions } from 'vuex'
import ImportContentResultItem from './ImportContentResultItem.vue'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import MenuTopicTreeItem from '@/modules/menu/components/topics/MenuTopicTreeItem.vue'

export default {
    components: { ImportContentResultItem, FontAwesomeIcon },
    props: {
        importedLayers: {
            type: Array,
            default: () => [],
        },
        maxSize: {
            type: Object,
            default: undefined,
        },
    },
    data() {
        return {
            revertSort: false,
            selectedLayer: undefined,
            description: '',
        }
    },
    computed: {
        sortedList() {
            if (this.importedLayers) {
                const layers = [...this.importedLayers]
                let sortedList = layers.sort((layerA, layerB) => {
                    return layerA.name.localeCompare(layerB.name)
                })
                if (this.revertSort) {
                    sortedList = sortedList.reverse()
                }
                return sortedList
            }
            return []
        },
    },
    methods: {
        ...mapActions(['addLayer', 'setPreviewLayer', 'clearPreviewLayer']),
        toggleSort() {
            this.revertSort = !this.revertSort
        },
        onItemClick(layer) {
            if (this.selectedLayer?.externalLayerId === layer.externalLayerId) {
                this.selectedLayer = undefined
                this.description = ''
            } else {
                this.selectedLayer = layer
                this.description = this.selectedLayer.abstract
            }
        },
        onPreviewStart(layer) {
            this.setPreviewLayer(layer)
            if (!this.selectedLayer) {
                this.description = layer.abstract
            }
        },
        onPreviewStop() {
            this.clearPreviewLayer()
        },
        onAddLayer() {
            if (this.selectedLayer) {
                this.addLayer(this.selectedLayer)
            }
        },
    },
}
</script>

<style lang="scss" scoped>
@import 'src/scss/webmapviewer-bootstrap-theme';
@import 'src/scss/media-query.mixin';

.results-list-container {
    height: calc(100% - 80px);
}

.results-container {
    display: flex;
    flex-direction: row;
    height: calc(100% - 20px);
}

.results-table-container {
    border: 1px solid $gray-300;
    border-radius: 0.375rem;
    max-width: 50%;
    .btn {
        border: none;
    }
}
.results-header {
    border-bottom: 1px solid $gray-300;
    font-weight: bold;
}
.results-list {
    height: calc(100% - 40px);
    .list-item:not(:last-child) {
        border-bottom: 1px solid $gray-300;
    }
}
.description-container {
    width: 50%;
    .description-title {
        font-weight: bold;
    }
    .description-text {
        height: 100%;
        resize: none;
    }
    .add-btn-container.disabled {
        cursor: not-allowed;
    }
}
@media (max-width: $breakpoint_tablet) {
    .results-container {
        flex-direction: column;
    }
    .results-table-container {
        max-width: 100%;
        .results-list {
            height: 150px;
        }
    }
    .description-container {
        width: 100%;

        .description-text,
        .description-title {
            display: none;
        }
    }
}
</style>
