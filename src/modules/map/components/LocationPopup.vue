<script setup>
/** Right click pop up which shows the coordinates of the position under the cursor. */

// importing directly the vue component, see https://github.com/ivanvermeyen/vue-collapse-transition/issues/5
import tippy from 'tippy.js'
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useStore } from 'vuex'

import CesiumPopover from '@/modules/map/components/cesium/CesiumPopover.vue'
import LocationPopupPositionTest from '@/modules/map/components/LocationPopupPositionTest.vue'
import LocationPopupShareTest from '@/modules/map/components/LocationPopupShareTest.vue'
import OpenLayersPopover from '@/modules/map/components/openlayers/OpenLayersPopover.vue'

const selectedTab = ref('position')
const i18n = useI18n()
const store = useStore()

const clickInfo = computed(() => store.state.map.clickInfo)
const projection = computed(() => store.state.position.projection)
const showIn3d = computed(() => store.state.cesium.active)
const copyButton = ref(null)
const copyTooltip = ref(null)

const mappingFrameworkSpecificPopup = computed(() => {
    if (showIn3d.value) {
        return CesiumPopover
    }
    return OpenLayersPopover
})
const coordinate = computed(() => {
    return clickInfo.value?.coordinate
})

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
        <div ref="copyButton"></div>
        <div>
            <div @close="toggleEmbedSharing" data-cy="import-file-content">
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
                            @click="selectedTab = 'position'"
                        >
                            Position
                        </button>
                    </li>
                    <li class="nav-item" role="presentation">
                        <button
                            class="nav-link py-1"
                            :class="{
                                active: selectedTab === 'share',
                            }"
                            type="button"
                            role="tab"
                            aria-controls="nav-share"
                            :aria-selected="selectedTab === 'share'"
                            data-cy="import-file-share-btn"
                            @click="selectedTab = 'share'"
                        >
                            Share
                        </button>
                    </li>
                </ul>
                <div class="tab-content mt-2">
                    <!-- Position Tab -->
                    <LocationPopupPositionTest
                        :class="{
                            active: selectedTab === 'position',
                            show: selectedTab === 'position',
                        }"
                        :coordinate="coordinate"
                        :click-info="clickInfo"
                        :projection="projection"
                    />
                    <!-- Share tab -->
                    <LocationPopupShareTest
                        :class="{ active: selectedTab === 'share', show: selectedTab === 'share' }"
                    />
                </div>
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
