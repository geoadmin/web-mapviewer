<script setup>
import { computed, onMounted, ref, toRefs, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useStore } from 'vuex'

import { createShortLink } from '@/api/shortlink.api'
import MenuShareInputCopyButton from '@/modules/menu/components/share/MenuShareInputCopyButton.vue'
import MenuShareSocialNetworks from '@/modules/menu/components/share/MenuShareSocialNetworks.vue'
import { stringifyQuery } from '@/utils/url-router'

const store = useStore()
const emit = defineEmits(['shareLink'])

const props = defineProps({
    coordinate: {
        type: Boolean,
        required: true,
    },
    clickInfo: {
        type: Object,
        required: true,
    },
    currentLang: {
        type: Object,
        required: true,
    },
    showEmbedSharing: {
        type: Boolean,
        required: true,
        default: false,
    },
})
const { coordinate, clickInfo, currentLang, showEmbedSharing } = toRefs(props)
const shareLinkUrlShorten = ref(null)
const shareLinkUrl = ref(null)
const route = useRoute()

const zoom = computed(() => store.state.position.zoom)

onMounted(() => {
    if (clickInfo.value) {
        if (showEmbedSharing.value) {
            updateShareLink()
        }
    }
})

watch(clickInfo, () => {
    if (showEmbedSharing.value) {
        updateShareLink()
    }
})
watch(currentLang, () => {
    if (showEmbedSharing.value) {
        setTimeout(() => updateShareLink(), 1)
    }
})
watch(zoom, () => {
    if (showEmbedSharing.value) {
        setTimeout(() => updateShareLink(), 1)
    }
})
watch(showEmbedSharing, () => {
    if (showEmbedSharing.value) {
        updateShareLink()
    }
})

function updateShareLink() {
    let query = {
        ...route.query,
        crosshair: 'marker',
        center: coordinate.value.join(','),
    }
    shareLinkUrl.value = `${location.origin}/#/map?${stringifyQuery(query)}`
    shortenShareLink(shareLinkUrl.value)
}
async function shortenShareLink(url) {
    try {
        shareLinkUrlShorten.value = await createShortLink(url)
        emit('shareLink', shareLinkUrlShorten.value)
    } catch (error) {
        shareLinkUrlShorten.value = null
    }
}
</script>

<template>
    <!-- Online Tab -->
    <div
        id="nav-online"
        class="tab-pane fade"
        role="tabpanel"
        aria-labelledby="nav-online-tab"
        data-cy="import-file-online-content"
    >
        <form class="input-group d-flex needs-validation">
            <div class="menu-share-embed">
                <MenuShareSocialNetworks :short-link="shareLinkUrlShorten" class="pt-1" />
                <MenuShareInputCopyButton
                    :input-text="shareLinkUrlShorten"
                    :copy-text="'copy_url'"
                    :copied-text="'copy_success'"
                    class="px-0 py-2"
                    data-cy="location-popup-link-bowl-crosshair"
                />
            </div>
        </form>
        <ImportFileButtons class="mt-2" :button-state="buttonState" @load-file="loadFile" />
    </div>
</template>

<style lang="scss" scoped>
@import 'src/scss/webmapviewer-bootstrap-theme';
.location-popup {
    @extend .clear-no-ios-long-press;

    &-link {
        display: flex;
        align-items: center;
    }
}
</style>
