<script setup>
import { ref } from 'vue'
import { useStore } from 'vuex'

import ImportFileLocalTab from '@/modules/menu/components/advancedTools/ImportFile/ImportFileLocalTab.vue'
import ImportFileOnlineTab from '@/modules/menu/components/advancedTools/ImportFile/ImportFileOnlineTab.vue'
import SimpleWindow from '@/utils/components/SimpleWindow.vue'

const selectedTab = ref('online')

const store = useStore()
</script>

<template>
    <teleport to="#map-footer-middle-1">
        <SimpleWindow
            title="import_file"
            class="rounded-0"
            @close="store.dispatch('toggleImportFile')"
        >
            <div data-cy="import-file-content" class="container">
                <ul class="nav nav-tabs" role="tablist">
                    <li class="nav-item" role="presentation">
                        <button
                            class="nav-link py-1"
                            :class="{
                                active: selectedTab === 'online',
                            }"
                            type="button"
                            role="tab"
                            aria-controls="nav-online"
                            :aria-selected="selectedTab === 'online'"
                            data-cy="import-file-online-btn"
                            @click="selectedTab = 'online'"
                        >
                            Online
                        </button>
                    </li>
                    <li class="nav-item" role="presentation">
                        <button
                            class="nav-link py-1"
                            :class="{
                                active: selectedTab === 'local',
                            }"
                            type="button"
                            role="tab"
                            aria-controls="nav-local"
                            :aria-selected="selectedTab === 'local'"
                            data-cy="import-file-local-btn"
                            @click="selectedTab = 'local'"
                        >
                            Local
                        </button>
                    </li>
                </ul>
                <div class="tab-content mt-2">
                    <!-- Online Tab -->
                    <ImportFileOnlineTab :active="selectedTab === 'online'" />
                    <!-- Local tab -->
                    <ImportFileLocalTab :active="selectedTab === 'local'" />
                </div>
            </div>
        </SimpleWindow>
    </teleport>
</template>

<style lang="scss" scoped>
@import 'src/scss/webmapviewer-bootstrap-theme';
</style>
