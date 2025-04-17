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
const expandedSubGroups = ref({})

function toggleGroup(baseUrl) {
    expandedGroups.value[baseUrl] = !expandedGroups.value[baseUrl]
}

function toggleSubGroup(baseUrl, subGroupKey) {
    if (!expandedSubGroups.value[baseUrl]) {
        expandedSubGroups.value[baseUrl] = {}
    }
    expandedSubGroups.value[baseUrl][subGroupKey] = !expandedSubGroups.value[baseUrl][subGroupKey]
}

const titleCaretIcon = computed(() => (baseUrl) => `caret-${expandedGroups.value[baseUrl] ? 'down' : 'right'}`)
const subGroupCaretIcon = computed(() => (baseUrl, subGroupKey) => `caret-${expandedSubGroups.value[baseUrl]?.[subGroupKey] ? 'down' : 'right'}`)

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

const groupedProvidersWithSubGroups = computed(() => {
    const result = {};
    for (const [baseUrl, providers] of Object.entries(groupedProviders)) {
        if (providers.length === 1) {
            // If there is only one provider in the group, show it as a provider URL, not a group
            result[baseUrl] = {
                fullUrl: providers[0].url, // Use the common prefix to determine the full URL
                relativeUrl: providers[0].url,
                emphasize: providers[0].emphasize,
            };
            continue;
        }

        const urls = providers.map(provider => provider.url);
        const commonPrefix = getLongestCommonPrefix(urls);
        const subGroups = {};

        providers.forEach(provider => {
            const relativeUrl = provider.url.replace(commonPrefix || baseUrl, '');
            const subGroupKey = relativeUrl.split('/')[0];

            if (!subGroups[subGroupKey]) {
                subGroups[subGroupKey] = [];
            }
            subGroups[subGroupKey].push({
                ...provider,
                relativeUrl: relativeUrl.replace(subGroupKey + '/', ''),
            });
        });

        result[baseUrl] = {
            commonPrefix: commonPrefix || baseUrl,
            subGroups: Object.entries(subGroups).flatMap(([key, subGroupProviders]) => {
                if (subGroupProviders.length === 1) {
                    // Show the single provider like there is no sub-group, without the prefix
                    return subGroupProviders.map(provider => ({
                        ...provider,
                        relativeUrl: provider.url.replace(commonPrefix || baseUrl, ''),
                    }));
                }
                return {
                    key,
                    providers: subGroupProviders,
                };
            }),
        };
    }
    return result;
});

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
            <template v-for="(group, baseUrl) in groupedProvidersWithSubGroups" :key="baseUrl">
                <div v-if="Array.isArray(group.subGroups)" class="providers-group" data-cy="import-provider-group">
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
                        <template v-for="subGroup in group.subGroups" :key="subGroup.key">
                            <div v-if="subGroup.providers?.length > 1" class="providers-sub-group" data-cy="import-provider-sub-group">
                                <div
                                    class="providers-sub-group-header px-2 py-1 text-nowrap"
                                    @click="toggleSubGroup(baseUrl, subGroup.key)"
                                >
                                    <font-awesome-icon :icon="['fas', subGroupCaretIcon(baseUrl, subGroup.key)]" />
                                    <span class="ms-1">{{ subGroup.key }}</span>
                                </div>
                                <div
                                    v-show="expandedSubGroups[baseUrl]?.[subGroup.key]"
                                    class="providers-sub-group-items ms-3"
                                >
                                    <div
                                        v-for="(provider, key) in subGroup.providers"
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
                                    @keydown.enter.prevent="emit('chooseProvider', subGroup.url)"
                                    @click="emit('chooseProvider', subGroup.url)"
                                >
                                    <TextSearchMarker
                                        :text="subGroup.relativeUrl"
                                        :search="subGroup.emphasize"
                                    />
                                </div>
                            </div>
                        </template>
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
                        @keydown.enter.prevent="emit('chooseProvider', group.fullUrl)"
                        @click="emit('chooseProvider', group.fullUrl)"
                    >
                        <TextSearchMarker
                            :text="group.relativeUrl"
                            :search="group.emphasize"
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
            z-index: 2; // Ensure it stays above sub-groups
            background-color: $body-bg; // Ensure it matches the background
            width: 100%; // Expand to full width
            white-space: nowrap; // Prevent text wrapping
            overflow: hidden; // Prevent any text from showing behind
            margin-bottom: 0; // Remove gap between group and sub-group headers
        }

        .providers-group-items {
            padding-left: 1rem;
        }

        .providers-sub-group-header {
            cursor: pointer;
            font-weight: bold;
            position: sticky;
            top: 1.5rem; // Adjust to place below the group header
            z-index: 1; // Ensure it stays below the group header
            background-color: $body-bg; // Ensure it matches the background
            width: 100%; // Expand to full width
            white-space: nowrap; // Prevent text wrapping
            overflow: hidden; // Prevent any text from showing behind
            margin-top: 0; // Remove gap between group and sub-group headers
        }

        .providers-sub-group-items {
            padding-left: 1rem;
        }
    }
}
</style>
