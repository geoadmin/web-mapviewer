<template>
    <button class="button-with-icon btn" :class="buttonClasses" @click="forwardClickEvent">
        <FontAwesomeIcon
            v-if="iconsBeforeText && buttonFontAwesomeIcon && buttonFontAwesomeIcon.length > 0"
            class="icon"
            :icon="buttonFontAwesomeIcon"
        />
        <span v-if="buttonTitle" :class="labelClasses">
            {{ buttonTitle }}
        </span>
        <slot />
        <FontAwesomeIcon
            v-if="!iconsBeforeText && buttonFontAwesomeIcon && buttonFontAwesomeIcon.length > 0"
            class="icon"
            :icon="buttonFontAwesomeIcon"
            :size="iconSize"
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
            required: true,
        },
        iconSize: {
            type: String,
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
        secondary: {
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
        outlineDanger: {
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
        round: {
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
            } else if (this.secondary) {
                classes.push('btn-secondary')
            } else if (this.danger) {
                classes.push('btn-danger')
            } else if (this.outlineDanger) {
                classes.push('btn-outline-danger')
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
            if (this.round) {
                classes.push('round')
            }
            return classes
        },
        labelClasses() {
            let className
            if (this.direction === 'column') {
                className = this.iconsBeforeText ? 'mt-2' : 'mb-2'
            } else {
                className = this.iconsBeforeText ? 'ms-2' : 'me-2'
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
    display: flex;
    align-items: center;
    &.btn-no-style {
        background: none;
        border: none;
    }
    &.round .svg-inline--fa {
        width: 10px;
        height: 10px;
        padding: 2px;
        box-shadow: 0 0 2px #c7c7c7;
        border: 1px solid #afafaf;
        border-radius: 50%;
        justify-content: center;
    }
}
svg {
    transition: transform 0.2s, color 0.2s;
    .flip & {
        transform: rotate(180deg);
    }
}
</style>
