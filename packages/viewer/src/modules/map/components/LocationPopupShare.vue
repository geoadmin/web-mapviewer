<script setup lang="ts">
import MenuShareInputCopyButton from '@/modules/menu/components/share/MenuShareInputCopyButton.vue'
import MenuShareSocialNetworks from '@/modules/menu/components/share/MenuShareSocialNetworks.vue'
import useUIStore from '@/store/modules/ui'

const { shareLinkUrlShorten } = defineProps<{
    shareLinkUrlShorten?: string
}>()

const uiStore = useUIStore()
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
            :short-link="shareLinkUrlShorten"
            class="pt-1"
        />
        <MenuShareInputCopyButton
            :input-text="shareLinkUrlShorten"
            :label-text="'share_link'"
            :copy-text="'copy_url'"
            :copied-text="'copy_success'"
            class="px-0 py-2"
            data-cy="location-popup-link-bowl-crosshair"
            :small="uiStore.isDesktopMode"
        />
    </div>
</template>
