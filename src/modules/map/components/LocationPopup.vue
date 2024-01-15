<script setup>
/** Right click pop up which shows the coordinates of the position under the cursor. */

// importing directly the vue component, see https://github.com/ivanvermeyen/vue-collapse-transition/issues/5
import tippy from 'tippy.js'
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useStore } from 'vuex'

import CesiumPopover from '@/modules/map/components/cesium/CesiumPopover.vue'
import LocationPopupPosition from '@/modules/map/components/LocationPopupPosition.vue'
import LocationPopupShare from '@/modules/map/components/LocationPopupShare.vue'
import OpenLayersPopover from '@/modules/map/components/openlayers/OpenLayersPopover.vue'

const selectedTab = ref('position')
const i18n = useI18n()
const store = useStore()

const clickInfo = computed(() => store.state.map.clickInfo)
const projection = computed(() => store.state.position.projection)
const showIn3d = computed(() => store.state.cesium.active)
const currentLang = computed(() => store.state.i18n.lang)
const shareLinkUrlValue = ref(null)
const showEmbedSharing = ref(false)
const copyButton = ref(null)
const copyTooltip = ref(null)
const requestClipboard = ref(false)

const buttonIcon = computed(() => {
    if (requestClipboard.value) {
        return 'check'
    }
    // as copy is part of the "Regular" icon set, we have to give the 'far' identifier
    return ['far', 'copy']
})
const mappingFrameworkSpecificPopup = computed(() => {
    if (showIn3d.value) {
        return CesiumPopover
    }
    return OpenLayersPopover
})
const coordinate = computed(() => {
    return clickInfo.value?.coordinate
})
watch(requestClipboard, showTooltip)

onMounted(() => {
    copyTooltip.value = tippy(copyButton.value, {
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
    copyTooltip.value.destroy()
})

function clearClick() {
    store.dispatch('clearClick')
    showEmbedSharing.value = false
}

function showTooltip() {
    copyTooltip.value.show()
}
</script>

<template>
    <component
        :is="mappingFrameworkSpecificPopup"
        v-if="coordinate"
        :title="$t('')"
        :coordinates="coordinate"
        :projection="projection"
        use-content-padding
        class="location-popup"
        data-cy="location-popup"
        @close="clearClick"
    >
        <div data-cy="import-file-content">
            <ul class="nav nav-tabs" role="tablist">
                <li class="nav-item" role="presentation">
                    <button
                        class="nav-link py-1"
                        :class="{
                            active: selectedTab === 'position',
                        }"
                        type="button"
                        role="tab"
                        aria-controls="nav-position"
                        :aria-selected="selectedTab === 'position'"
                        data-cy="import-file-position-btn"
                        @click="(selectedTab = 'position'), (showEmbedSharing = false)"
                    >
                        Position
                    </button>
                </li>
                <li class="nav-item" role="presentation">
                    <button
                        ref="copyButton"
                        class="nav-link py-1"
                        :class="{
                            active: selectedTab === 'share',
                        }"
                        type="button"
                        role="tab"
                        aria-controls="nav-share"
                        :aria-selected="selectedTab === 'share'"
                        data-cy="import-file-share-btn"
                        @click="
                            (selectedTab = 'share'),
                                (showEmbedSharing = true),
                                (requestClipboard = true)
"
                    >
                        Share <FontAwesomeIcon class="icon" :icon="buttonIcon" />
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
                    :coordinate="coordinate"
                    :click-info="clickInfo"
                    :current-lang="currentLang"
                    :show-embed-sharing="showEmbedSharing"
                    :share-link-url-value="shareLinkUrlValue"
                />
            </div>
        </div>
    </component>
</template>

<style lang="scss" scoped>
@import 'src/scss/webmapviewer-bootstrap-theme';
.location-popup {
    @extend .clear-no-ios-long-press;

    &-coordinates {
        display: grid;
        grid-template-columns: max-content auto;
        grid-column-gap: 8px;
        font-size: 0.75rem;
        grid-row-gap: 2px;
        &-label {
            white-space: nowrap;
        }
    }
}
</style>
