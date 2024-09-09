<template>
    <div
        ref="tippyAnchor"
        class="m-0 p-0 d-flex align-content-center justify-content-center"
        @click="onClick"
    >
        <slot />
    </div>
    <ModalWithBackdrop
        v-if="showCompleteDisclaimer"
        :title="$t('external_data_tooltip')"
        fluid
        @close="showCompleteDisclaimer = false"
    >
        <div class="external_data_warning">
            {{ $t('external_data_warning').replace('--URL--', sourceName) }}
        </div>
    </ModalWithBackdrop>
</template>

<script>
import tippy from 'tippy.js'
import { mapState } from 'vuex'

import ModalWithBackdrop from '@/utils/components/ModalWithBackdrop.vue'

export default {
    components: { ModalWithBackdrop },
    props: {
        completeDisclaimerOnClick: {
            type: Boolean,
            default: false,
        },
        showTippy: {
            type: Boolean,
            default: true,
        },
        sourceName: {
            type: String,
            default: '',
        },
        isExternalDataLocal: {
            type: Boolean,
            default: false,
        },
    },
    data() {
        return {
            showCompleteDisclaimer: false,
        }
    },
    computed: {
        ...mapState({
            currentLang: (state) => state.i18n.lang,
        }),
        tooltipContent() {
            return this.isExternalDataLocal
                ? this.$t('warn_share_local_file')
                : this.$t('external_data_tooltip')
        },
    },
    watch: {
        currentLang() {
            this.tippyInstance.setContent(this.tooltipContent)
        },
    },
    mounted() {
        if (this.showTippy) {
            this.tippyInstance = tippy(this.$refs.tippyAnchor, {
                theme: this.isExternalDataLocal ? 'secondary' : 'primary',
                content: this.tooltipContent,
                arrow: true,
                placement: 'top',
                touch: false,
                delay: 250,
                onCreate: (instance) => {
                    instance.popper.setAttribute(
                        'data-cy',
                        this.isExternalDataLocal
                            ? `tippy-warn-share-local-file`
                            : `tippy-third-part-disclaimer`
                    )
                },
            })
        }
    },
    beforeUnmount() {
        if (this.showTippy) {
            this.tippyInstance.destroy()
        }
    },
    methods: {
        onClick() {
            this.showCompleteDisclaimer =
                this.completeDisclaimerOnClick && this.sourceName && this.sourceName.length > 0
        },
    },
}
</script>
<style lang="scss" scoped>
@import '@/scss/webmapviewer-bootstrap-theme';
.external_data_warning {
    @extend .clear-no-ios-long-press;
}
</style>
