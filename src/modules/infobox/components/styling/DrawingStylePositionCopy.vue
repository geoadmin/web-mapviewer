<template>
    <div v-if="isFeatureMarker || isFeatureText" class="d-flex">
        <div class="small d-flex">
            <FontAwesomeIcon icon="fas fa-map-marker-alt" />
            &nbsp;
            {{ formatCoordinates(feature.coordinates.slice(0, 2)) }}
        </div>
        <button class="btn btn-sm btn-light d-flex" @click="copyValue">
            <FontAwesomeIcon class="icon" :icon="buttonIcon" />
        </button>
    </div>
</template>

<script>
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import tippy from 'tippy.js'

export default {
    components: { FontAwesomeIcon },
    props: {
        /** The button should have either a title or icons (or both) */
        icon: {
            type: String,
            default: 'pen',
        },
        popoverTitle: {
            type: String,
            default: null,
        },
    },
    mounted() {
        this.popover = tippy(this.$refs.popoverButton, {
            theme: 'popover-button light-border',
            content: this.$refs.popoverContent,
            allowHTML: true,
            placement: 'top',
            interactive: true,
            arrow: true,
            trigger: 'click',
            // We need a large popover to display the BABS icon set label which is quite big, see
            // modify_icon_category_babs_label
            maxWidth: 450,
        })
    },
    beforeUnmount() {
        this.popover.destroy()
    },
    methods: {
        /** Hides the popover container, can be called outside (by this component's parent) */
        hidePopover() {
            this.popover.hide()
        },
    },
}
</script>
