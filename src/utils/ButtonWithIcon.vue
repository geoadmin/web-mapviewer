<template>
    <button class="button-with-icon d-flex btn" :class="buttonClasses" @click="forwardClickEvent">
        <font-awesome-icon
            v-if="iconsBeforeText && buttonFontAwesomeIcon && buttonFontAwesomeIcon.length > 0"
            :icon="buttonFontAwesomeIcon"
        />
        <span :class="{ 'ms-1': iconsBeforeText }">
            {{ buttonTitle }}
        </span>
        <font-awesome-icon
            v-if="!iconsBeforeText && buttonFontAwesomeIcon && buttonFontAwesomeIcon.length > 0"
            :icon="buttonFontAwesomeIcon"
        />
    </button>
</template>
<script>
export default {
    props: {
        buttonTitle: {
            type: String,
            default: '',
        },
        buttonFontAwesomeIcon: {
            type: Array,
            default: null,
        },
        iconsBeforeText: {
            type: Boolean,
            default: false,
        },
        small: {
            type: Boolean,
            default: false,
        },
        large: {
            type: Boolean,
            default: false,
        },
        primary: {
            type: Boolean,
            default: false,
        },
        outlineSecondary: {
            type: Boolean,
            default: false,
        },
        outlineLight: {
            type: Boolean,
            default: false,
        },
        danger: {
            type: Boolean,
            default: false,
        },
        dark: {
            type: Boolean,
            default: false,
        },
        transparent: {
            type: Boolean,
            default: false,
        },
    },
    emits: ['click'],
    computed: {
        buttonClasses: function () {
            const classes = []
            if (this.small) {
                classes.push('btn-sm')
            } else if (this.large) {
                classes.push('btn-lg')
            }
            if (this.primary) {
                classes.push('btn-primary')
            } else if (this.danger) {
                classes.push('btn-danger')
            } else if (this.outlineSecondary) {
                classes.push('btn-outline-secondary')
            } else if (this.outlineLight) {
                classes.push('btn-outline-light', 'text-dark')
            } else if (this.dark) {
                classes.push('btn-dark')
            } else if (this.transparent) {
                classes.push('btn-no-style')
            } else {
                classes.push('btn-light')
            }
            return classes
        },
    },
    methods: {
        forwardClickEvent: function (event) {
            this.$emit('click', event)
        },
    },
}
</script>
<style lang="scss" scoped>
.button-with-icon {
    align-items: center;
    &.btn-no-style {
        background: none;
        border: none;
    }
}
</style>
