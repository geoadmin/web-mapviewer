<template>
    <div v-if="shortLink" class="d-flex">
        <ShareNetwork
            v-for="network in networks"
            :key="network.id"
            :network="network.id"
            :url="shortLink"
            title=""
            class="btn btn-default"
        >
            <FontAwesomeIcon :icon="network.icons" size="xl" />
        </ShareNetwork>
    </div>
</template>

<script>
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
        }
    },
}
</script>
