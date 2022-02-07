<template>
    <div id="visible-layers-copyrights" class="d-flex p-1" data-cy="layers-copyrights">
        <div v-if="copyrights.length > 0">{{ $t('copyright_data') }}</div>
        <div v-for="(copyright, index) in copyrights" :key="copyright.attributionName">
            <a
                v-if="copyright.attributionUrl"
                :href="copyright.attributionUrl"
                target="_blank"
                class="copyright"
                :data-cy="`layer-copyright-${copyright.attributionName}`"
            >
                {{ getAttributionWithComaIfNeeded(copyright.attributionName, index) }}
            </a>
            <span
                v-else
                class="copyright"
                :data-cy="`layer-copyright-${copyright.attributionName}`"
            >
                {{ getAttributionWithComaIfNeeded(copyright.attributionName, index) }}
            </span>
        </div>
    </div>
</template>
<script>
import { mapGetters } from 'vuex'

export default {
    computed: {
        ...mapGetters(['visibleLayers', 'currentBackgroundLayer']),
        layers() {
            return [this.currentBackgroundLayer, ...this.visibleLayers].filter(Boolean)
        },
        copyrights() {
            const copyrights = []
            this.layers.forEach((layer) => {
                // only keeping one of each occurrence of the same data owner
                if (
                    layer.attributionName &&
                    !copyrights.find(
                        (copyright) => copyright.attributionName === layer.attributionName
                    )
                ) {
                    copyrights.push({
                        attributionName: layer.attributionName,
                        attributionUrl: layer.attributionUrl,
                    })
                }
            })
            return copyrights
        },
    },
    methods: {
        getAttributionWithComaIfNeeded(attribution, index) {
            return `${attribution}${index !== this.copyrights.length - 1 ? ',' : ''}`
        },
    },
}
</script>
<style lang="scss" scoped>
@import 'src/scss/webmapviewer-bootstrap-theme';
#visible-layers-copyrights {
    font-size: 0.7rem;
    background: rgba($white, 0.7);
    .copyright {
        color: $black;
        text-decoration: none;
        margin-left: 2px;
    }
    a.copyright:hover {
        text-decoration: underline;
    }
}
</style>
