<template>
    <button class="btn" :class="buttonClasses" @click="forwardClickEvent">
        {{ buttonTitle }}
        <font-awesome-icon
            v-if="buttonFontAwesomeIcon && buttonFontAwesomeIcon.length > 0"
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
    },
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
