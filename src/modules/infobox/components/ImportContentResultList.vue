<template>
    <div class="d-flex flex-column">
        <div></div>
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
                        class="list-item"
                        :class="{ odd: (index + 1) % 2 }"
                        @click-on-item="() => addLayer(layer)"
                        @preview-start="() => {}"
                        @preview-stop="() => {}"
                    />
                </div>
            </div>
            <div class="d-flex flex-column flex-grow-1 description-container">
                <span class="description-title">{{ $t('description') }}</span>
                <textarea class="description-text" readonly></textarea>
                <div
                    class="add-btn-container mb-2"
                    :class="{
                        disabled: true,
                    }"
                >
                    <button
                        type="button"
                        class="btn btn-outline-secondary add-btn mt-1 w-100"
                        :disabled="true"
                        @click="() => {}"
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

export default {
    components: { ImportContentResultItem, FontAwesomeIcon },
    props: {
        importedLayers: {
            type: Array,
            default: () => [],
        },
    },
    data() {
        return {
            revertSort: false,
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
    },
}
</script>

<style lang="scss" scoped>
@import 'src/scss/webmapviewer-bootstrap-theme';
@import 'src/scss/media-query.mixin';

.results-container {
    display: flex;
    flex-direction: row;
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
    height: 300px;
    .list-item:not(:last-child) {
        border-bottom: 1px solid $gray-300;
    }
    .list-item {
        background-color: $gray-100;
    }
    .list-item.odd {
        background-color: white;
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
        width: 100%;
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
