<script setup lang="ts">
import { computed } from 'vue'

import MenuShareInputCopyButton from '@/modules/menu/components/share/MenuShareInputCopyButton.vue'
import MenuShareSocialNetworks from '@/modules/menu/components/share/MenuShareSocialNetworks.vue'
import useUIStore from '@/store/modules/ui.store'

interface Props {
    shareLinkUrlShorten: string | undefined
}

const props = defineProps<Props>()

const uiStore = useUIStore()

const isDesktopMode = computed(() => uiStore.isDesktopMode)
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
        <MenuShareSocialNetworks
            :short-link="props.shareLinkUrlShorten"
            class="pt-1"
        />
        <MenuShareInputCopyButton
            :input-text="props.shareLinkUrlShorten"
            :label-text="'share_link'"
            :copy-text="'copy_url'"
            :copied-text="'copy_success'"
            class="px-0 py-2"
            data-cy="location-popup-link-bowl-crosshair"
            :small="isDesktopMode"
        />
    </div>
</template>
