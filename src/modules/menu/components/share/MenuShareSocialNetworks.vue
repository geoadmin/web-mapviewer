<template>
    <div v-if="shortLink" class="d-flex">
        <ShareNetwork
            v-for="network in networks"
            :key="network.id"
            :network="network.id"
            :url="shortLink"
            title=""
            class="btn btn-default"
            :options="shareNetworkOptions"
            :data-cy="`share-shortlink-${network.id}`"
        >
            <FontAwesomeIcon :icon="network.icons" size="2x" />
        </ShareNetwork>
    </div>
</template>

<script>
import { API_SERVICES_BASE_URL } from '@/config'

/**
 * List of buttons enabling the user to easily share a short link to some social networks. All
 * sharing to external social media will be done through a popup.
 */
export default {
    props: {
        shortLink: {
            type: String,
            default: null,
        },
    },
    data() {
        return {
            networks: [
                {
                    id: 'email',
                    icons: 'envelope',
                },
                {
                    id: 'qrcode',
                    icons: 'qrcode',
                },
                {
                    id: 'facebook',
                    icons: ['fa-brands', 'facebook'],
                },
                {
                    id: 'twitter',
                    icons: ['fa-brands', 'twitter'],
                },
            ],
            // while waiting for official app.use support from vue-social-share
            // we can define the network options here instead
            shareNetworkOptions: {
                networks: {
                    qrcode: `${API_SERVICES_BASE_URL}qrcode/generate?url=@url`,
                },
            },
        }
    },
}
</script>
