<template>
    <div v-if="feature" class="card drawing-style-popup">
        <div class="card-header">
            <span class="float-left">{{ $t('draw_popup_title_feature') }}</span>
            <button type="button" class="close" aria-label="Close" @click="onClose">
                <span aria-hidden="true">&times;</span>
            </button>
        </div>
        <div class="card-body text-left">
            <form>
                <div v-if="feature.geometry.type === 'Point'" class="form-group">
                    <label for="text">{{ $t('draw_popup_title_annotation') }}:</label>
                    <textarea id="text" v-model="text" class="form-control" rows="1"></textarea>
                </div>
                <div class="form-group">
                    <label for="description">{{ $t('modify_description') }}:</label>
                    <textarea
                        id="description"
                        v-model="description"
                        class="form-control"
                        rows="2"
                    ></textarea>
                </div>
                <div class="form-group p-0 button-bar">
                    <geometry-measure :geometry="feature.geometry"></geometry-measure>
                    <button type="button" class="btn btn-default" @click="onDelete">
                        <font-awesome-icon :icon="['far', 'trash-alt']" />
                    </button>
                </div>
            </form>
        </div>
    </div>
</template>

<script>
import GeometryMeasure from './GeometryMeasure.vue'

export default {
    components: { GeometryMeasure },
    props: {
        feature: {
            type: Object,
            default: null,
        },
    },
    computed: {
        description: {
            get() {
                return this.feature.properties.description
            },
            set(value) {
                const properties = Object.assign({}, this.feature.properties, {
                    description: value,
                })
                this.$emit('updateProperties', this.feature.id, properties)
            },
        },
        text: {
            get() {
                return this.feature.properties.text
            },
            set(value) {
                const properties = Object.assign({}, this.feature.properties, {
                    text: value,
                })
                this.$emit('updateProperties', this.feature.id, properties)
            },
        },
    },
    methods: {
        onClose: function () {
            this.$emit('close', this.feature.id)
        },
        onDelete: function () {
            this.$emit('delete', this.feature.id)
        },
    },
}
</script>

<style lang="scss">
.drawing-style-popup {
    width: 320px;
    position: absolute;
    z-index: 1000;
    .card-header {
        font-size: 14px;
        padding: 8px 14px;
    }
    .card-body {
        padding: 9px 14px;
        font-size: 12px;
        button {
            width: 44px;
            height: 34px;
            margin-left: 5px;
            float: right;
            background-color: #e6e6e6;
            border-color: #ccc;
            color: #333;
            &:hover {
                border-color: #adadad;
                background-color: #cdcdcd;
            }
        }
        .form-group {
            margin-bottom: 5px;
        }
        .button-bar {
            line-height: 34px;
            margin-bottom: 0;
        }
    }
    .form-control {
        font-size: 12px;
    }
    .btn-default {
        background-color: lightgrey;
        svg {
            height: 10px;
            vertical-align: initial;
        }
    }
    label {
        margin-bottom: 5px;
        font-weight: 700;
        font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
    }
}
</style>
