<template>
    <div>
        <ButtonWithIcon
            ref="popoverButton"
            :button-title="buttonTitle"
            :button-font-awesome-icon="buttonFontAwesomeIcon"
            :primary="primary"
            :small="small"
            :danger="danger"
        ></ButtonWithIcon>
        <div
            ref="popoverContent"
            class="popover-container"
            @click="!withCloseButton && hidePopover()"
        >
            <div class="card">
                <div
                    v-if="popoverTitle || withCloseButton"
                    class="card-header d-flex align-items-center"
                    :class="{
                        'justify-content-between': popoverTitle,
                        'justify-content-end': !popoverTitle,
                    }"
                >
                    <span v-if="popoverTitle">
                        {{ popoverTitle }}
                    </span>
                    <ButtonWithIcon
                        v-if="withCloseButton"
                        small
                        :button-font-awesome-icon="['fa', 'times']"
                        @click="hidePopover"
                    />
                </div>
                <div class="card-body p-0">
                    <slot />
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import tippy from 'tippy.js'
import ButtonWithIcon from '@/utils/ButtonWithIcon.vue'

/** @enum */
export const POPOVER_POSITION = {
    auto: 'auto',
    left: 'left',
    right: 'right',
    top: 'top',
    bottom: 'bottom',
}

/**
 * Component that will render a button which will show a popover when clicked.
 *
 * This popover can be passed as a slot of this component, and the button's behavior/look and feel
 * are customizable through some props (such as primary in order to show a bootstrap's primary color
 * for the button, or passing an array of fontawesome IDs into buttonFontAwesomeIcon in order to
 * show this icon in the button)
 *
 * The popover will close itself automatically if a click occurs in its container or outside of it
 * (with an exception when the flag withCloseButton is true, see its documentation)
 */
export default {
    components: { ButtonWithIcon },
    props: {
        /** The button should have either a title or icons (or both) */
        buttonTitle: {
            type: String,
            default: '',
        },
        /** The button should have either a title or icons (or both) */
        buttonFontAwesomeIcon: {
            type: Array,
            default: null,
        },
        /** Flag telling if the button should harbor bootstrap's primary color */
        primary: {
            type: Boolean,
            default: false,
        },
        /** Flag telling if the button should harbor bootstrap's danger color */
        danger: {
            type: Boolean,
            default: false,
        },
        /** Flag telling if the main button should be smaller */
        small: {
            type: Boolean,
            default: false,
        },
        /** Title given to the popover header */
        popoverTitle: {
            type: String,
            default: null,
        },
        /**
         * Tells where to place the popover relative to the button, default is 'auto' meaning it
         * will choose the position where there is the most space
         */
        popoverPosition: {
            type: String,
            default: POPOVER_POSITION.auto,
            validator: (val) => Object.values(POPOVER_POSITION).includes(val),
        },
        /**
         * Flag telling if the popover should have a close button, if true then a click in the
         * popover container will not close it automatically
         */
        withCloseButton: {
            type: Boolean,
            default: false,
        },
    },
    data() {
        return {
            popover: null,
        }
    },
    watch: {
        popoverPosition: function (newValue) {
            if (newValue in POPOVER_POSITION) {
                this.popover.setProps({
                    placement: newValue,
                })
            }
        },
    },
    mounted() {
        // creating the TippyJS instance
        this.popover = tippy(this.$refs.popoverButton.$el, {
            content: this.$refs.popoverContent,
            // so that it doesn't sanitize the content of the slot
            allowHTML: true,
            placement: this.popoverPosition,
            // so that it lets the click event go through to the slot
            interactive: true,
            // shows an arrow at the border of the popover that points to the button location
            arrow: true,
            trigger: 'click',
        })
    },
    methods: {
        /** Hides the popover container, can be called outside (by this component's parent) */
        hidePopover: function () {
            this.popover.hide()
        },
    },
}
</script>

<style scoped>
@import '~tippy.js/dist/svg-arrow.css';
</style>
