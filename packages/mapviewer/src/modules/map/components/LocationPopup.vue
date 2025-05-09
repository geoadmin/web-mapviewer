<script setup>
/** Right click pop up which shows the coordinates of the position under the cursor. */

import log from '@geoadmin/log'
import GeoadminTooltip from '@geoadmin/tooltip'
import { computed, ref, useTemplateRef, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'
import { useStore } from 'vuex'

import { createShortLink } from '@/api/shortlink.api'
import CesiumPopover from '@/modules/map/components/cesium/CesiumPopover.vue'
import LocationPopupPosition from '@/modules/map/components/LocationPopupPosition.vue'
import LocationPopupShare from '@/modules/map/components/LocationPopupShare.vue'
import { MapPopoverMode } from '@/modules/map/components/MapPopover.vue'
import OpenLayersPopover from '@/modules/map/components/openlayers/OpenLayersPopover.vue'
import { stringifyQuery } from '@/utils/url-router'

const dispatcher = { dispatcher: 'LocationPopup.vue' }

const { t } = useI18n()
const store = useStore()
const route = useRoute()

const clickInfo = computed(() => store.state.map.clickInfo)
const projection = computed(() => store.state.position.projection)
const showIn3d = computed(() => store.state.cesium.active)
const currentLang = computed(() => store.state.i18n.lang)
const showEmbedSharing = computed(() => selectedTab.value === 'share')
const coordinate = computed(() => store.state.map.locationPopupCoordinates)

const selectedTab = ref('position')
const shareTooltip = useTemplateRef('shareTooltip')
const newClickInfo = ref(true)
const requestClipboard = ref(false)
const shareLinkCopied = ref(false)
const shareLinkUrl = ref(null)
const shareLinkUrlShorten = ref(null)

const mappingFrameworkSpecificPopup = computed(() => {
    if (showIn3d.value) {
        return CesiumPopover
    }
    return OpenLayersPopover
})

const copyButtonIcon = computed(() => {
    if (shareLinkCopied.value) {
        return 'check'
    }
    // as copy is part of the "Regular" icon set, we have to give the 'far' identifier
    return ['far', 'copy']
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
    () => {
        if (showEmbedSharing.value) {
            updateShareLink()
        }
    },
    {
        deep: true,
    }
)

function showCopiedTooltip() {
    shareTooltip.value.openTooltip()
}

function closeCopiedTooltip() {
    shareTooltip.value.closeTooltip()
}

function updateShareLink() {
    const query = {
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

function onPositionTabClick() {
    selectedTab.value = 'position'
    newClickInfo.value = false
}

async function onShareTabClick() {
    if (newClickInfo.value && showEmbedSharing.value === false) {
        //copyShareLink is called by watcher since new shortlink is computed with a delay
        requestClipboard.value = true
    } else {
        copyShareLink()
    }
    selectedTab.value = 'share'
    newClickInfo.value = false
}

async function copyShareLink() {
    try {
        await navigator.clipboard.writeText(shareLinkUrlShorten.value)
        showCopiedTooltip()
        shareLinkCopied.value = true
        setTimeout(() => {
            shareLinkCopied.value = false
            closeCopiedTooltip()
        }, 1000)
    } catch (error) {
        log.error(`Failed to copy to clipboard:`, error)
    }
}

function clearClick() {
    store.dispatch('clearLocationPopupCoordinates', dispatcher)
    requestClipboard.value = false
}
</script>

<template>
    <component
        :is="mappingFrameworkSpecificPopup"
        v-if="coordinate"
        :title="selectedTab === 'position' ? t('position') : t('link_bowl_crosshair')"
        :coordinates="coordinate"
        :projection="projection"
        :mode="MapPopoverMode.FEATURE_TOOLTIP"
        use-content-padding
        class="location-popup"
        data-cy="location-popup"
        @close="clearClick"
    >
        <ul
            class="nav nav-tabs nav-justified"
            role="tablist"
        >
            <li
                class="nav-item"
                role="presentation"
            >
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
                    {{ t('position') }}
                </button>
            </li>
            <li
                class="nav-item"
                role="presentation"
            >
                <GeoadminTooltip
                    ref="shareTooltip"
                    placement="top"
                    :tooltip-content="t('copy_success')"
                    open-trigger="manual"
                >
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
                        <!-- Italian text does not fit on one line with normal sized text -->
                        <div
                            :class="{
                                small: currentLang === 'it',
                            }"
                        >
                            {{ t('link_bowl_crosshair') }} &nbsp;&nbsp;<FontAwesomeIcon
                                data-cy="location-popup-share-tab-check"
                                class="px-0 icon"
                                :icon="copyButtonIcon"
                            />
                        </div>
                    </button>
                </GeoadminTooltip>
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
@import '@/scss/webmapviewer-bootstrap-theme';

.location-popup {
    width: $overlay-width;
}
</style>
