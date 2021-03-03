<template>
    <div class="menu-layer-list-item">
        <div class="menu-list-item-title">
            <button class="btn btn-default" @click="onRemoveLayer">
                <font-awesome-icon size="lg" :icon="['fas', 'times-circle']" />
            </button>
            <button class="btn btn-default" @click="onToggleLayerVisibility">
                <font-awesome-icon size="lg" :icon="['far', checkboxIcon]" />
            </button>
            <span class="menu-item-name" @click="onToggleLayerVisibility">{{ name }}</span>
            <button
                class="btn btn-default animate__animated animate__faster"
                :class="{ animate__pulse: showDetails }"
                @click="toggleShowDetails"
            >
                <font-awesome-icon size="lg" :icon="['fas', 'cog']" />
            </button>
        </div>
        <div v-show="showDetails" class="menu-layer-list-item-details">
            <div class="menu-layer-list-item-details-transparency">
                <span class="transparency-title">Transparency</span>
                <input
                    class="transparency-slider"
                    type="range"
                    min="0.0"
                    max="1.0"
                    step="0.01"
                    :value="opacity"
                    @change="onOpacityChange"
                />
            </div>
            <div class="menu-layer-list-item-details-order">
                <button class="btn btn-default" @click="onOrderChange(1)">
                    <font-awesome-icon size="lg" :icon="['fas', 'arrow-up']" />
                </button>
                <button class="btn btn-default" @click="onOrderChange(-1)">
                    <font-awesome-icon size="lg" :icon="['fas', 'arrow-down']" />
                </button>
            </div>
        </div>
    </div>
</template>

<style lang="scss">
@import 'node_modules/bootstrap/scss/bootstrap';
@import '../../scss/menu-items';
.menu-layer-list-item {
    @extend .menu-list-item;
    .menu-layer-list-item-details {
        border-left: 3px solid #666;
        .menu-layer-list-item-details-transparency {
            display: flex;
            flex-grow: 1;
            .transparency-title {
                font-size: 0.9rem;
            }
            .transparency-slider {
                display: flex;
                flex-grow: 1;
            }
        }
    }
}
</style>

<script>
/**
 * Representation of an active layer in the menu, with the name of the layer and some controls (like
 * visibility, opacity or position in the layer stack)
 */
export default {
    props: {
        id: {
            type: String,
            required: true,
        },
        visible: {
            type: Boolean,
            required: true,
        },
        name: {
            type: String,
            required: true,
        },
        opacity: {
            type: Number,
            default: 1.0,
        },
    },
    data() {
        return {
            showDetails: false,
        }
    },
    computed: {
        checkboxIcon: function () {
            if (this.visible) {
                return 'check-square'
            }
            return 'square'
        },
        clogTransformation: function () {
            const transformation = {
                rotate: 0,
            }
            if (this.showDetails) {
                transformation.rotate = 180
            }
            return transformation
        },
    },
    methods: {
        toggleShowDetails: function () {
            this.showDetails = !this.showDetails
        },
        onRemoveLayer: function () {
            this.$emit('removeLayer', this.id)
        },
        onToggleLayerVisibility: function () {
            this.$emit('toggleLayerVisibility', this.id)
        },
        onOpacityChange: function (e) {
            this.$emit('opacityChange', this.id, e.target.value)
        },
        onOrderChange: function (delta) {
            this.$emit('orderChange', this.id, delta)
        },
    },
}
</script>
