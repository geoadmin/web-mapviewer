<template>
    <button class="button-with-icon d-flex btn" :class="buttonClasses" @click="forwardClickEvent">
        <FontAwesomeIcon
            v-if="iconsBeforeText && buttonFontAwesomeIcon && buttonFontAwesomeIcon.length > 0"
            :icon="buttonFontAwesomeIcon"
        />
        <span v-if="buttonTitle" :class="labelClasses">
            {{ buttonTitle }}
        </span>
        <FontAwesomeIcon
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
        direction: {
            type: String,
            default: 'row',
            validator(value) {
                return ['row', 'column'].includes(value)
            },
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
        buttonClasses() {
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
            if (this.direction === 'column') {
                classes.push('flex-column')
            }
            return classes
        },
        labelClasses() {
            let className
            if (this.direction === 'column') {
                className = this.iconsBeforeText ? 'mt-1' : 'mb-1'
            } else {
                className = this.iconsBeforeText ? 'ms-1' : 'me-1'
            }
            return className
        },
    },
    methods: {
        forwardClickEvent(event) {
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
svg {
    transition: transform 0.2s, color 0.2s;
    .flip & {
        transform: rotate(180deg);
    }
}
</style>
