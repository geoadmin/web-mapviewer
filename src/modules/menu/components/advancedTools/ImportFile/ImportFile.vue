<script setup>
import { ref } from 'vue'

import ImportFileOnlineTab from '@/modules/menu/components/advancedTools/ImportFile/ImportFileOnlineTab.vue'
import ImportFileLocalTab from '@/modules/menu/components/advancedTools/ImportFile/ImportFileLocalTab.vue'

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
                    data-bs-toggle="tab"
                    data-bs-target="#nav-online"
                    type="button"
                    role="tab"
                    aria-controls="nav-online"
                    :aria-selected="selectedTab === 'online'"
                    data-cy="online-import-btn"
                    @click="() => (selectedTab = 'online')"
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
                    data-bs-toggle="tab"
                    data-bs-target="#nav-local"
                    type="button"
                    role="tab"
                    aria-controls="nav-local"
                    :aria-selected="selectedTab === 'local'"
                    data-cy="local-import-btn"
                    @click="() => (selectedTab = 'local')"
                >
                    Local
                </button>
            </li>
        </ul>
        <div class="tab-content mt-2">
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
.nav-tabs {
    .nav-link.active {
        background-color: $primary;
        color: white;
    }
}
</style>
