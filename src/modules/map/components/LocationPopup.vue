<script setup>
/** Right click pop up which shows the coordinates of the position under the cursor. */

// importing directly the vue component, see https://github.com/ivanvermeyen/vue-collapse-transition/issues/5
import tippy from 'tippy.js'
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'
import { useStore } from 'vuex'

import { createShortLink } from '@/api/shortlink.api'
import CesiumPopover from '@/modules/map/components/cesium/CesiumPopover.vue'
import LocationPopupPosition from '@/modules/map/components/LocationPopupPosition.vue'
import LocationPopupShare from '@/modules/map/components/LocationPopupShare.vue'
import OpenLayersPopover from '@/modules/map/components/openlayers/OpenLayersPopover.vue'
import log from '@/utils/logging'
import { stringifyQuery } from '@/utils/url-router'

const i18n = useI18n()
const store = useStore()

const clickInfo = computed(() => store.state.map.clickInfo)
const projection = computed(() => store.state.position.projection)
const showIn3d = computed(() => store.state.cesium.active)
const currentLang = computed(() => store.state.i18n.lang)

const route = useRoute()
const selectedTab = ref('position')
const shareTabButton = ref(null)
const newClickInfo = ref(true)
const showEmbedSharing = ref(false)
const requestClipboard = ref(false)
const shareLinkCopied = ref(false)
const shareLinkUrl = ref(null)
const shareLinkUrlShorten = ref(null)
let copyTooltipInstance = null

const mappingFrameworkSpecificPopup = computed(() => {
    if (showIn3d.value) {
        return CesiumPopover
    }
    return OpenLayersPopover
})
const coordinate = computed(() => {
    return clickInfo.value?.coordinate
})
const copyButtonIcon = computed(() => {
    if (shareLinkCopied.value) {
        return 'check'
    }
    // as copy is part of the "Regular" icon set, we have to give the 'far' identifier
    return ['far', 'copy']
})

onMounted(() => {
    if (clickInfo.value) {
        if (showEmbedSharing.value) {
            updateShareLink()
        }
    }
})

watch(clickInfo, () => {
    newClickInfo.value = true
    requestClipboard.value = false
    if (showEmbedSharing.value) {
        updateShareLink()
    }
})
watch(shareLinkUrlShorten, () => {
    if (requestClipboard.value) {
        copyShareLink()
        requestClipboard.value = false
    }
})
watch(showEmbedSharing, () => {
    if (showEmbedSharing.value) {
        updateShareLink()
    }
})
watch(
    () => route.query,
    (newQuery, oldQuery) => {
        //Cannot watch language and zoom directly due to the delayed url update
        if (showEmbedSharing.value) {
            if (oldQuery['z'] != newQuery['z'] || oldQuery['lang'] != newQuery['lang']) {
                updateShareLink()
            }
        }
        console.log('Query parameters changed:', newQuery)
    }
)

onMounted(() => {
    copyTooltipInstance = tippy(shareTabButton.value, {
        content: i18n.t('copy_success'),
        arrow: true,
        placement: 'right',
        trigger: 'manual',
        onShow(instance) {
            setTimeout(() => {
                instance.hide()
            }, 1000)
        },
    })
})

onBeforeUnmount(() => {
    copyTooltipInstance.destroy()
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
    } catch (error) {
        log.error(`Failed to create shortlink`, error)
        shareLinkUrlShorten.value = null
    }
}

function clearClick() {
    store.dispatch('clearClick')
    showEmbedSharing.value = false
    requestClipboard.value = false
}

function showCopiedTooltip() {
    copyTooltipInstance.show()
}

function onPositionTabClick() {
    selectedTab.value = 'position'
    showEmbedSharing.value = false
    newClickInfo.value = false
}

async function onShareTabClick() {
    selectedTab.value = 'share'
    if (newClickInfo.value && showEmbedSharing.value == false) {
        //copyShareLink is called by watcher since new shortlink is computed with a delay
        requestClipboard.value = true
    } else {
        copyShareLink()
    }
    showEmbedSharing.value = true
    newClickInfo.value = false
}

async function copyShareLink() {
    try {
        await navigator.clipboard.writeText(shareLinkUrlShorten.value)
        showCopiedTooltip()
        shareLinkCopied.value = true
        setTimeout(() => {
            shareLinkCopied.value = false
        }, 1000)
    } catch (error) {
        log.error(`Failed to copy to clipboard:`, error)
    }
}
</script>

<template>
    <component
        :is="mappingFrameworkSpecificPopup"
        v-if="coordinate"
        :title="selectedTab == 'position' ? $t('position') : $t('link_bowl_crosshair')"
        :coordinates="coordinate"
        :projection="projection"
        use-content-padding
        class="location-popup"
        data-cy="location-popup"
        @close="clearClick"
    >
        <ul class="nav nav-tabs nav-justified" role="tablist">
            <li class="nav-item" role="presentation">
                <button
                    class="nav-link py-1"
                    :class="{
                        active: selectedTab === 'position',
                    }"
                    data-cy="location-popup-position-tab-button"
                    type="button"
                    role="tab"
                    aria-controls="nav-position"
                    :aria-selected="selectedTab === 'position'"
                    @click="onPositionTabClick()"
                >
                    {{ $t('position') }}
                </button>
            </li>
            <li class="nav-item" role="presentation">
                <button
                    ref="shareTabButton"
                    class="nav-link py-1 px-0"
                    :class="{
                        active: selectedTab === 'share',
                    }"
                    data-cy="location-popup-share-tab-button"
                    type="button"
                    role="tab"
                    aria-controls="nav-share"
                    :aria-selected="selectedTab === 'share'"
                    @click="onShareTabClick()"
                >
                    {{ $t('link_bowl_crosshair') }} &nbsp;&nbsp;<FontAwesomeIcon
                        v-if="currentLang != 'it'"
                        class="px-0 icon"
                        :icon="copyButtonIcon"
                    />
                </button>
            </li>
        </ul>
        <div class="tab-content mt-2">
            <!-- Position Tab -->
            <LocationPopupPosition
                :class="{
                    active: selectedTab === 'position',
                    show: selectedTab === 'position',
                }"
                :coordinate="coordinate"
                :click-info="clickInfo"
                :projection="projection"
                :current-lang="currentLang"
            />
            <!-- Share tab -->
            <LocationPopupShare
                :class="{ active: selectedTab === 'share', show: selectedTab === 'share' }"
                :share-link-url-shorten="shareLinkUrlShorten"
            />
        </div>
    </component>
</template>

<style lang="scss" scoped>
@import 'src/scss/webmapviewer-bootstrap-theme';
.location-popup {
    @extend .clear-no-ios-long-press;
}
</style>
