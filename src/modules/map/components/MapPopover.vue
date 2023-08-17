<template>
    <div ref="mapPopover" class="map-popover" data-cy="popover" @contextmenu.stop>
        <div class="card">
            <div class="card-header d-flex">
                <span class="flex-grow-1 align-self-center">
                    {{ title }}
                </span>
                <slot name="extra-buttons"></slot>
                <button
                    v-if="authorizePrint"
                    class="btn btn-sm btn-light d-flex align-items-center"
                    @click="printContent"
                >
                    <FontAwesomeIcon icon="print" />
                </button>
                <button
                    class="btn btn-sm btn-light d-flex align-items-center"
                    data-cy="map-popover-close-button"
                    @click="onClose"
                >
                    <FontAwesomeIcon icon="times" />
                </button>
            </div>
            <div
                id="mapPopoverContent"
                ref="mapPopoverContent"
                class="map-popover-content"
                :class="{ 'card-body': useContentPadding }"
            >
                <slot />
            </div>
        </div>
    </div>
</template>

<script>
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import promptUserToPrintHtmlContent from '@/utils/print'

/** Map popover content and styles. Position handling is done in corresponding library components */
export default {
    components: { FontAwesomeIcon },
    props: {
        authorizePrint: {
            type: Boolean,
            default: false,
        },
        title: {
            type: String,
            default: '',
        },
        useContentPadding: {
            type: Boolean,
            default: false,
        },
    },
    emits: ['close'],
    methods: {
        getMapPopoverRef() {
            return this.$refs.mapPopover
        },
        onClose() {
            this.$emit('close')
        },
        printContent() {
            promptUserToPrintHtmlContent('mapPopoverContent')
        },
    },
}
</script>

<style lang="scss" scoped>
@import 'src/scss/webmapviewer-bootstrap-theme';

.map-popover {
    pointer-events: none;
    .card {
        max-width: $overlay-width;
        pointer-events: auto;
    }
    .map-popover-content {
        max-height: 350px;
        overflow-y: auto;
    }
    .card-body {
        display: flex;
        flex-direction: column;
    }
    // Triangle border
    $arrow-height: 12px;
    &::before {
        position: absolute;
        top: -($arrow-height * 2);
        left: 50%;
        margin-left: -$arrow-height;
        border: $arrow-height solid transparent;
        border-bottom-color: $border-color-translucent;
        content: '';
    }
    // Triangle background
    &::after {
        $arrow-border-height: $arrow-height - 1;
        content: '';
        border: $arrow-border-height solid transparent;
        border-bottom-color: $light;
        position: absolute;
        top: -($arrow-border-height * 2);
        left: 50%;
        margin-left: -$arrow-border-height;
    }
}
@media (min-height: 600px) {
    .map-popover .card-body {
        max-height: 510px;
    }
}
</style>
