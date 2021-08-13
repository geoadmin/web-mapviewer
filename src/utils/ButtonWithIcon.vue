<template>
    <button ref="popoverButton" class="btn" :class="buttonClasses" @click="forwardClickEvent">
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
        buttonBootstrapClass: {
            type: String,
            default: 'btn-default',
        },
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
        primary: {
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
            const classes = [this.buttonBootstrapClass]
            if (this.small) {
                classes.push('btn-sm')
            }
            if (this.primary) {
                classes.push('btn-primary')
            } else if (this.danger) {
                classes.push('btn-danger')
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
@import 'src/scss/bootstrap-theme';
</style>
