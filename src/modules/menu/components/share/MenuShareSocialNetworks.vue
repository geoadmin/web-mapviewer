<script setup>
/**
 * List of buttons enabling the user to easily share a short link to some social networks. All
 * sharing to external social media will be done through a popup.
 */

import { onUpdated, ref, toRefs } from 'vue'
import { useI18n } from 'vue-i18n'
import { ShareNetwork } from 'vue3-social-sharing'

import { getGenerateQRCodeUrl } from '@/api/qrcode.api'
import { useTippyTooltip } from '@/utils/composables/useTippyTooltip'

const props = defineProps({
    shortLink: {
        type: String,
        default: null,
    },
})
const { shortLink } = toRefs(props)

const i18n = useI18n()
const { refreshTippyAttachment } = useTippyTooltip('.share-network-button[data-tippy-content]')

const networks = ref([
    {
        id: 'email',
        icons: 'envelope',
        tooltip: 'mail_tooltip',
        subject: 'share_map_title',
    },
    {
        id: 'facebook',
        icons: ['fa-brands', 'facebook'],
        tooltip: 'facebook_tooltip',
    },
    {
        id: 'linkedin',
        icons: ['fa-brands', 'linkedin'],
        tooltip: 'linkedin_tooltip',
    },
    {
        id: 'twitter',
        icons: ['fa-brands', 'x-twitter'],
        tooltip: 'twitter_tooltip',
    },
    {
        id: 'whatsapp',
        icons: ['fa-brands', 'whatsapp'],
        tooltip: 'whatsapp_tooltip',
    },
])

const buttonClass = 'btn btn-sm btn-light share-network-button'
const iconSize = '2x'

function openQrcode() {
    const windowSize = 250
    const windowPosition = [
        window.screenTop + window.innerHeight / 2,
        window.screenLeft + window.innerWidth / 2 - windowSize / 2,
    ]
    window.open(
        getGenerateQRCodeUrl(shortLink.value),
        '_blank',
        `popup,width=${windowSize},height=${windowSize},top=${windowPosition[0]},left=${windowPosition[1]}`
    )
}

onUpdated(() => refreshTippyAttachment())
</script>

<template>
    <div v-if="shortLink" class="d-flex">
        <ShareNetwork
            v-for="network in networks"
            :key="network.id"
            v-slot="{ share }"
            :network="network.id"
            :url="shortLink"
            :title="network.subject ? i18n.t(network.subject) : ''"
        >
            <button
                :class="buttonClass"
                :data-cy="`share-shortlink-${network.id}`"
                :data-tippy-content="network.tooltip"
                @click="share"
            >
                <FontAwesomeIcon :icon="network.icons" :size="iconSize" />
            </button>
        </ShareNetwork>
        <button
            :class="buttonClass"
            data-cy="share-shortlink-qrcode"
            data-tippy-content="qrcode_tooltip"
            @click="openQrcode"
        >
            <FontAwesomeIcon icon="qrcode" :size="iconSize" />
        </button>
    </div>
</template>

<style lang="scss" scoped>
@import '@/scss/webmapviewer-bootstrap-theme';

.share-network-button {
    margin-right: $button-spacer;
}
</style>
