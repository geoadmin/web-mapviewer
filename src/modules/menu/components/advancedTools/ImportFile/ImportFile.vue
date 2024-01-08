<script setup>
import { ref } from 'vue'

import ImportFileLocalTab from '@/modules/menu/components/advancedTools/ImportFile/ImportFileLocalTab.vue'
import ImportFileOnlineTab from '@/modules/menu/components/advancedTools/ImportFile/ImportFileOnlineTab.vue'

const selectedTab = ref('online')
</script>

<template>
    <div data-cy="import-file-content">
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
        <div class="tab-content mt-1">
            <!-- Online Tab -->
            <ImportFileOnlineTab
                :class="{ active: selectedTab === 'online', show: selectedTab === 'online' }"
            />
            <!-- Local tab -->
            <ImportFileLocalTab
                :class="{ active: selectedTab === 'local', show: selectedTab === 'local' }"
            />
        </div>
    </div>
</template>

<style lang="scss" scoped>
@import 'src/scss/webmapviewer-bootstrap-theme';
</style>
