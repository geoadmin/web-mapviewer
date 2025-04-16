<script setup>
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { ref, computed, watch } from 'vue'
import { useTemplateRef } from 'vue'

import TextSearchMarker from '@/utils/components/TextSearchMarker.vue'

const { showProviders, groupedProviders, filterApplied } = defineProps({
    showProviders: {
        type: Boolean,
        default: false,
    },
    groupedProviders: {
        type: Object /* Object of grouped providers by base URL */,
        default() {
            return {}
        },
    },
    filterApplied: {
        type: Boolean,
        default: false,
    },
})

const emit = defineEmits(['chooseProvider', 'hide'])

const providerList = useTemplateRef('providerList')
const expandedGroups = ref({})

function toggleGroup(baseUrl) {
    expandedGroups.value[baseUrl] = !expandedGroups.value[baseUrl]
}

const titleCaretIcon = computed(() => (baseUrl) => `caret-${expandedGroups.value[baseUrl] ? 'down' : 'right'}`)

function goToPrevious(currentKey) {
    if (currentKey === 0) {
        return
    }
    const key = currentKey - 1
    providerList.value.querySelector(`[tabindex="${key}"]`).focus()
}

function goToNext(currentKey) {
    if (currentKey >= providers.length - 1) {
        return
    }
    const key = currentKey + 1
    providerList.value.querySelector(`[tabindex="${key}"]`).focus()
}

function goToFirst() {
    providerList.value.querySelector('[tabindex="0"]').focus()
}

function goToLast() {
    providerList.value.querySelector(`[tabindex="${providers.length - 1}"]`).focus()
}

function getLongestCommonPrefix(urls) {
    if (!urls.length) return '';
    let prefix = urls[0];
    for (const url of urls) {
        while (!url.startsWith(prefix)) {
            prefix = prefix.slice(0, -1);
            if (!prefix) break;
        }
    }
    // Ensure the prefix ends with a '/'
    return prefix.endsWith('/') ? prefix : prefix.slice(0, prefix.lastIndexOf('/') + 1);
}

const groupedProvidersWithPrefixes = computed(() => {
    const result = {};
    for (const [baseUrl, providers] of Object.entries(groupedProviders)) {
        const urls = providers.map(provider => provider.url);
        const commonPrefix = getLongestCommonPrefix(urls);
        result[baseUrl] = {
            commonPrefix: commonPrefix || baseUrl,
            providers: providers.map(provider => ({
                ...provider,
                relativeUrl: providers.length > 1
                    ? provider.url.replace(commonPrefix || baseUrl, '')
                    : provider.url, // Show full URL if only one provider
            })),
        };
    }
    return result;
})

// Watch for changes in groupedProviders and set the expandedGroups state
// based on the filterApplied prop
watch(() => groupedProviders, (currentGroupProviders) => {
    Object.keys(currentGroupProviders).forEach(baseUrl => {
        expandedGroups.value[baseUrl] = filterApplied
    })
})

defineExpose({ goToFirst })
</script>

<template>
    <div
        v-show="showProviders"
        class="providers-list-container shadow border rounded-bottom overflow-auto"
    >
        <div
            ref="providerList"
            class="providers-list"
            data-cy="import-provider-list"
        >
            <template v-for="(group, baseUrl) in groupedProvidersWithPrefixes" :key="baseUrl">
                <div v-if="group.providers.length > 1" class="providers-group" data-cy="import-provider-group">
                    <div
                        class="providers-group-header px-2 py-1 text-nowrap"
                        @click="toggleGroup(baseUrl)"
                    >
                        <font-awesome-icon :icon="['fas', titleCaretIcon(baseUrl)]" />
                        <span class="ms-1">{{ group.commonPrefix }}</span>
                    </div>
                    <div
                        v-show="expandedGroups[baseUrl]"
                        class="providers-group-items ms-3"
                    >
                        <div
                            v-for="(provider, key) in group.providers"
                            :key="provider.url"
                            :tabindex="key"
                            class="providers-list-item px-2 py-1 text-nowrap"
                            data-cy="import-provider-item"
                            @keydown.up.prevent="goToPrevious(key)"
                            @keydown.down.prevent="() => goToNext(key)"
                            @keydown.home.prevent="goToFirst"
                            @keydown.end.prevent="goToLast"
                            @keydown.esc.prevent="emit('hide')"
                            @keydown.enter.prevent="emit('chooseProvider', provider.url)"
                            @click="emit('chooseProvider', provider.url)"
                        >
                            <TextSearchMarker
                                :text="provider.relativeUrl"
                                :search="provider.emphasize"
                            />
                        </div>
                    </div>
                </div>
                <div v-else class="providers-list-item px-2 py-1 text-nowrap" data-cy="import-provider-item">
                    <div
                        :tabindex="0"
                        @keydown.up.prevent="goToPrevious(0)"
                        @keydown.down.prevent="() => goToNext(0)"
                        @keydown.home.prevent="goToFirst"
                        @keydown.end.prevent="goToLast"
                        @keydown.esc.prevent="emit('hide')"
                        @keydown.enter.prevent="emit('chooseProvider', group.providers[0].url)"
                        @click="emit('chooseProvider', group.providers[0].url)"
                    >
                        <TextSearchMarker
                            :text="group.providers[0].url"
                            :search="group.providers[0].emphasize"
                        />
                    </div>
                </div>
            </template>
            <div
                v-show="Object.keys(groupedProviders).length === 0"
                class="providers-list-empty px-2 py-1"
            >
                <span>-</span>
            </div>
        </div>
    </div>
</template>

<style lang="scss" scoped>
@import '@/scss/webmapviewer-bootstrap-theme';
.providers-list-container {
    max-height: 13rem;

    .providers-list {
        .providers-list-empty {
            user-select: none;
        }

        .providers-list-item {
            cursor: pointer;
        }
        .providers-list-item:focus,
        .providers-list-item:hover {
            background-color: $list-item-hover-bg-color;
        }

        .providers-group-header {
            cursor: pointer;
            font-weight: bold;
            position: sticky;
            top: 0;
            z-index: 1;
            background-color: $body-bg; // Ensure it matches the background
            width: max-content; // Allow the header to expand to fit its content
            white-space: nowrap; // Prevent text wrapping
            overflow: visible; // Allow horizontal scrolling for long text
        }

        .providers-group-items {
            padding-left: 1rem;
        }
    }
}
</style>
