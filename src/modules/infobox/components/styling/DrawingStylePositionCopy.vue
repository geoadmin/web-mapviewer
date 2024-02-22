<template>
    <div class="d-flex align-items-center">
        <div class="small d-flex align-items-center text-end">
            <div>
                <FontAwesomeIcon class="small" icon="fas fa-map-marker-alt" />
                {{ formatCoordinates(coordinates.slice(0, 2)) }}
            </div>
        </div>
        <button
            class="btn btn-sm btn-light d-flex"
            data-cy="drawing-style-copy-button"
            @click="copyValue"
        >
            <FontAwesomeIcon data-cy="drawing-style-copy-icon" class="icon" :icon="buttonIcon" />
        </button>
    </div>
</template>

<script>
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

import { LV03Format } from '@/utils/coordinates/coordinateFormat'
import log from '@/utils/logging'

export default {
    components: { FontAwesomeIcon },
    props: {
        /** The button should have either a title or icons (or both) */
        coordinates: {
            type: Object,
            required: true,
        },
    },
    data() {
        return {
            copied: false,
        }
    },
    computed: {
        buttonIcon() {
            if (this.copied) {
                return 'check'
            }
            // as copy is part of the "Regular" icon set, we have to give the 'far' identifier
            return ['far', 'copy']
        },
    },
    methods: {
        /** Hides the popover container, can be called outside (by this component's parent) */
        hidePopover() {
            this.popover.hide()
        },
        formatCoordinates(coordinates) {
            return LV03Format.format(coordinates)
        },
        async copyValue() {
            try {
                await navigator.clipboard.writeText(
                    this.formatCoordinates(this.coordinates.slice(0, 2)).toString()
                )
                this.copied = true
                // leaving the "Copied" text for the wanted delay, and then reverting to "Copy"
                setTimeout(() => {
                    this.copied = false
                }, 1000)
            } catch (error) {
                log.error(`Failed to copy to clipboard:`, error)
            }
        },
    },
}
</script>
