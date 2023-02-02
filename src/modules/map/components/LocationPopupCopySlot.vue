<template>
    <button
        id="copyButton"
        ref="button"
        class="btn btn-light btn-sm"
        type="button"
        @click="copyValue"
    >
        <FontAwesomeIcon class="icon" :icon="['far', 'copy']" />
    </button>
</template>

<script>
import log from '@/utils/logging'
import tippy from 'tippy.js'
import { mapState } from 'vuex'

export default {
    props: {
        value: {
            type: String,
            default: '',
        },
    },
    computed: {
        ...mapState({
            lang: (state) => state.i18n.lang,
        }),
    },
    watch: {
        lang() {
            this.setTooltipContent()
        },
    },
    mounted() {
        this.copyTooltip = tippy('#copyButton', {
            arrow: true,
            placement: 'right',
            touch: 'hold',
        })

        this.copiedTooltip = tippy('#copyButton', {
            arrow: true,
            placement: 'right',
            trigger: 'click',
            onShow(instance) {
                setTimeout(() => {
                    instance.hide()
                }, 1000)
            },
            allowHTML: true,
        })
        this.setTooltipContent()
    },
    unmounted() {
        this.copyTooltip?.forEach((tooltip) => tooltip.destroy())
        this.copiedTooltip?.forEach((tooltip) => tooltip.destroy())
    },
    methods: {
        async copyValue() {
            try {
                await navigator.clipboard.writeText(this.value)
            } catch (error) {
                log.error(`Failed to copy to clipboard:`, error)
            }
        },
        setTooltipContent() {
            this.copyTooltip?.forEach((instance) => {
                instance.setContent(this.$i18n.t('copy_cta'))
            })
            this.copiedTooltip?.forEach((instance) => {
                instance.setContent(this.$i18n.t('copy_done'))
            })
        },
    },
}
</script>

<style lang="scss" scoped>
@import 'src/scss/webmapviewer-bootstrap-theme';
.btn-sm {
    float: right;
    margin-top: -0.1rem;
    margin-left: 0.8rem;
    padding: 0 0.2rem;
    vertical-align: baseline;
    font-size: inherit;
    display: none;
    @media (min-width: $overlay-width) {
        display: block;
    }
    color: $empress;
}
</style>
