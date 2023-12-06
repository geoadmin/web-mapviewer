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
        {{ $t('external_data_warning').replace('--URL--', sourceName) }}
    </ModalWithBackdrop>
</template>

<script>
import tippy from 'tippy.js'
import { mapState } from 'vuex'

import ModalWithBackdrop from '@/utils/ModalWithBackdrop.vue'

export default {
    components: { ModalWithBackdrop },
    props: {
        completeDisclaimerOnClick: {
            type: Boolean,
            default: false,
        },
        sourceName: {
            type: String,
            default: '',
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
            return this.$t('external_data_tooltip')
        },
    },
    watch: {
        currentLang() {
            this.tippyInstance.setContent(this.tooltipContent)
        },
    },
    mounted() {
        this.tippyInstance = tippy(this.$refs.tippyAnchor, {
            theme: 'primary',
            content: this.tooltipContent,
            arrow: true,
            placement: 'top',
            touch: false,
        })
    },
    beforeUnmount() {
        this.tippyInstance.destroy()
    },
    methods: {
        onClick() {
            this.showCompleteDisclaimer =
                this.completeDisclaimerOnClick && this.sourceName && this.sourceName.length > 0
        },
    },
}
</script>
