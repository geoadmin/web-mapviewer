<script setup lang="js">
/**
 * List of buttons enabling the user to easily share a short link to some social networks. All
 * sharing to external social media will be done through a popup.
 */

import GeoadminTooltip from '@swissgeo/tooltip'
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { ShareNetwork } from 'vue3-social-sharing'

import { getGenerateQRCodeUrl } from '@/api/qrcode.api'

const { shortLink } = defineProps({
    shortLink: {
        type: String,
        default: null,
    },
})

const { t } = useI18n()

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

const buttonClass = `btn btn-sm btn-light share-network-button`
const iconSize = '2x'

function openQrcode() {
    const windowSize = 250
    const windowPosition = [
        window.screenTop + window.innerHeight / 2,
        window.screenLeft + window.innerWidth / 2 - windowSize / 2,
    ]
    window.open(
        getGenerateQRCodeUrl(shortLink),
        '_blank',
        `popup,width=${windowSize},height=${windowSize},top=${windowPosition[0]},left=${windowPosition[1]}`
    )
}
</script>

<template>
    <div class="share-network">
        <ShareNetwork
            v-for="network in networks"
            :key="network.id"
            v-slot="{ share }"
            :network="network.id"
            :url="shortLink"
            :title="network.subject ? t(network.subject) : ''"
        >
            <GeoadminTooltip :tooltip-content="t(network.tooltip)">
                <button
                    :class="buttonClass"
                    :data-cy="`share-shortlink-${network.id}`"
                    @click="share"
                >
                    <FontAwesomeIcon
                        :icon="network.icons"
                        :size="iconSize"
                    />
                </button>
            </GeoadminTooltip>
        </ShareNetwork>
        <GeoadminTooltip :tooltip-content="t('qrcode_tooltip')">
            <button
                :class="buttonClass"
                data-cy="share-shortlink-qrcode"
                @click="openQrcode"
            >
                <FontAwesomeIcon
                    icon="qrcode"
                    :size="iconSize"
                />
            </button>
        </GeoadminTooltip>
    </div>
</template>

<style lang="scss" scoped>
@import '@/scss/webmapviewer-bootstrap-theme';

$shareButtonWidth: 46px;
.share-network {
    display: grid;
    grid-template-columns: repeat(auto-fit, $shareButtonWidth);
    gap: 0.25rem;
    justify-content: center;
    align-content: center;
    &-button {
        display: flex;
        justify-items: center;
        align-items: center;
        width: $shareButtonWidth;
        height: $shareButtonWidth;
    }
}
</style>
