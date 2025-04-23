<script setup>
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { reactive, watch } from 'vue'
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

function buildTreeNode(baseUrl, providers) {
    if (providers.length === 1) {
        return {
            id: baseUrl,
            name: providers[0].url,
            type: 'url',
            url: providers[0].url,
            emphasize: providers[0].emphasize,
        };
    }

    const urls = providers.map((provider) => provider.url);
    const commonPrefix = getLongestCommonPrefix(urls);
    const subGroups = {};

    providers.forEach((provider) => {
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

    return {
        id: baseUrl,
        name: commonPrefix || baseUrl,
        type: 'group',
        expanded: filterApplied,
        children: Object.entries(subGroups).map(([key, subGroupProviders]) => {
            if (subGroupProviders.length === 1) {
                return {
                    id: subGroupProviders[0].url,
                    name: key + '/' + subGroupProviders[0].relativeUrl,
                    type: 'url',
                    url: subGroupProviders[0].url,
                    emphasize: subGroupProviders[0].emphasize,
                };
            }
            return {
                id: `${baseUrl}-${key}`,
                name: key,
                type: 'group',
                expanded: false,
                children: subGroupProviders.map((provider) => ({
                    id: provider.url,
                    name: provider.relativeUrl,
                    type: 'url',
                    url: provider.url,
                    emphasize: provider.emphasize,
                })),
            };
        }),
    };
}

const treeData = reactive([]);

function addVisibleIndex(treeData) {
    let index = 0;

    function dfs(node) {
        node.visibleIndex = index++;
        if (node.children && node.children.length > 0) {
            node.children.forEach(child => dfs(child));
        }
    }

    treeData.forEach(node => dfs(node));
}

Object.entries(groupedProviders).forEach(([baseUrl, providers]) => {
    treeData.push(buildTreeNode(baseUrl, providers));
});
addVisibleIndex(treeData);
// console.log('treeData', treeData);

watch(() => groupedProviders, (newGroupedProviders) => {
    treeData.length = 0; // Clear the existing treeData
    Object.entries(newGroupedProviders).forEach(([baseUrl, providers]) => {
        treeData.push(buildTreeNode(baseUrl, providers));
    })
    addVisibleIndex(treeData);
    // console.log('treeData', treeData);
});

function toggleNode(node) {
    if (node.type === 'group') {
        node.expanded = !node.expanded;
    }
}

function emitProviderSelection(url) {
    emit('chooseProvider', url);
}

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
            <template v-for="node in treeData" :key="node.id">
                <component
                    :is="node.type === 'group' ? 'div' : 'div'"
                    :class="node.type === 'group' ? 'providers-group' : 'providers-list-item'"
                    :data-cy="node.type === 'group' ? 'import-provider-group' : 'import-provider-item'"
                    :visible-index="node.visibleIndex"
                >
                    <div
                        v-if="node.type === 'group'"
                        class="providers-group-header px-2 py-1 text-nowrap"
                        @click="toggleNode(node)"
                    >
                        <font-awesome-icon :icon="['fas', node.expanded ? 'caret-down' : 'caret-right']" />
                        <span class="ms-1">{{ node.name }}</span>
                    </div>
                    <div
                        v-if="node.type === 'group' && node.expanded"
                        :visible-index="node.visibleIndex"
                        class="providers-group-items ms-3"
                    >
                        <template v-for="child in node.children" :key="child.id">
                            <component
                                :is="child.type === 'group' ? 'div' : 'div'"
                                :class="child.type === 'group' ? 'providers-sub-group' : 'providers-list-item'"
                                :data-cy="child.type === 'group' ? 'import-provider-sub-group' : 'import-provider-item'"
                            >
                                <div
                                    v-if="child.type === 'group'"
                                    class="providers-sub-group-header px-2 py-1 text-nowrap"
                                    :visible-index="child.visibleIndex"
                                    @click="toggleNode(child)"
                                >
                                    <font-awesome-icon :icon="['fas', child.expanded ? 'caret-down' : 'caret-right']" />
                                    <span class="ms-1">{{ child.name }}</span>
                                </div>
                                <div
                                    v-if="child.type === 'group' && child.expanded"
                                    class="providers-sub-group-items ms-3"
                                >
                                    <div
                                        v-for="grandChild in child.children"
                                        :key="grandChild.id"
                                        class="providers-list-item px-2 py-1 text-nowrap"
                                        data-cy="import-provider-item"
                                        :visible-index="grandChild.visibleIndex"
                                        @click="emitProviderSelection(grandChild.url)"
                                    >
                                        <TextSearchMarker
                                            :text="grandChild.name"
                                            :search="grandChild.emphasize"
                                        />
                                    </div>
                                </div>
                                <div
                                    v-else-if="child.type === 'url'"
                                    class="providers-list-item px-2 py-1 text-nowrap"
                                    data-cy="import-provider-item"
                                    :visible-index="child.visibleIndex"
                                    @click="emitProviderSelection(child.url)"
                                >
                                    <TextSearchMarker
                                        :text="child.name"
                                        :search="child.emphasize"
                                    />
                                </div>
                            </component>
                        </template>
                    </div>
                    <div
                        v-else-if="node.type === 'url'"
                        class="providers-list-item px-2 py-1 text-nowrap"
                        data-cy="import-provider-item"
                        :visible-index="node.visibleIndex"
                        @click="emitProviderSelection(node.url)"
                    >
                        <TextSearchMarker
                            :text="node.name"
                            :search="node.emphasize"
                        />
                    </div>
                </component>
            </template>
            <div
                v-show="treeData.length === 0"
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
