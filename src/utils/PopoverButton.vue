<template>
    <div>
        <ButtonWithIcon
            ref="popoverButton"
            :button-title="buttonTitle"
            :button-font-awesome-icon="buttonFontAwesomeIcon"
            :primary="primary"
            :danger="danger"
        ></ButtonWithIcon>
        <div ref="popoverContent" class="popover-container" @click="hidePopover">
            <div class="card">
                <h5 v-if="popoverTitle" class="card-header">{{ popoverTitle }}</h5>
                <div class="card-body">
                    <slot />
                </div>
            </div>
        </div>
    </div>
</template>
<script>
import tippy from 'tippy.js'
import ButtonWithIcon from '@/utils/ButtonWithIcon'

/** @enum */
export const POPOVER_POSITION = {
    auto: 'auto',
    left: 'left',
    right: 'right',
    top: 'top',
    bottom: 'bottom',
}

export default {
    components: { ButtonWithIcon },
    props: {
        buttonTitle: {
            type: String,
            default: '',
        },
        buttonFontAwesomeIcon: {
            type: Array,
            default: null,
        },
        primary: {
            type: Boolean,
            default: false,
        },
        danger: {
            type: Boolean,
            default: false,
        },
        popoverTitle: {
            type: String,
            default: null,
        },
        popoverPosition: {
            type: String,
            default: POPOVER_POSITION.auto,
            validator: (val) => Object.values(POPOVER_POSITION).includes(val),
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
        this.popover = tippy(this.$refs.popoverButton.$el, {
            content: this.$refs.popoverContent,
            allowHTML: true,
            placement: this.popoverPosition,
            interactive: true,
            arrow: true,
            trigger: 'click',
        })
    },
    methods: {
        hidePopover: function () {
            this.popover.hide()
        },
    },
}
</script>
<style>
@import '~tippy.js/dist/svg-arrow.css';
</style>
