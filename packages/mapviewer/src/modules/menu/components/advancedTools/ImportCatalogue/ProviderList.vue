<script setup>
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { reactive, watch, ref, onMounted } from 'vue'
import { useTemplateRef } from 'vue'

import TextSearchMarker from '@/utils/components/TextSearchMarker.vue'
import { getLongestCommonPrefix } from '@/utils/utils.js'

/**
 * @typedef {Object} Provider
 * @property {string} url - The URL of the provider.
 * @property {string} htmlDisplay - The display name of the provider.
 * @property {string} emphasize - The emphasized text to highlight in the provider name.
 */

/**
 * @typedef {Object} ProviderTreeNode
 * @property {string} id - The unique identifier for the node.
 * @property {string} name - The display name of the node.
 * @property {string} type - The type of the node (`'group'` or `'url'`).
 * @property {string} [url] - The URL of the node (only for `'url'` type).
 * @property {boolean} emphasize - The emphasized text to highlight in the provider name.
 * @property {boolean} [expanded] - Whether the group node is expanded (only for `'group'` type).
 * @property {ProviderTreeNode[]} [children] - The child nodes (only for `'group'` type).
 */

const { showProviders, groupedProviders, filterApplied, filterText } = defineProps({
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
    filterText: {
        type: String,
        default: '',
    },
})

// reactive data
const emit = defineEmits(['chooseProvider', 'hide'])
const providerList = useTemplateRef('providerList')
const maxTabIndex = ref(0)
const treeData = reactive([])

/**
 * Builds a tree node structure from a base URL and an array of providers.
 *
 * This function creates a hierarchical structure of nodes. If there is only one provider,
 * it returns a URL node. If there are multiple providers, it groups them by their common
 * prefix and creates a group node with sub-group nodes for each unique prefix.
 *
 * @param {string} baseUrl - The base URL for the providers.
 * @param {Provider[]} providers - An array of provider objects.
 * @returns {ProviderTreeNode} - The constructed tree node.
 */
function buildTreeNode(baseUrl, providers) {
    if (providers.length === 1) {
        return {
            id: baseUrl,
            name: providers[0].htmlDisplay,
            type: 'url',
            url: providers[0].url,
            emphasize: providers[0].emphasize,
        }
    }

    const urls = providers.map((provider) => provider.url)
    const commonPrefix = getLongestCommonPrefix(urls)
    const subGroups = {}

    providers.forEach((provider) => {
        const relativeUrl = provider.htmlDisplay.replace(commonPrefix || baseUrl, '')
        // We group by the first part of the relative URL (good enough for our cases)
        const subGroupKey = relativeUrl.split('/')[0]

        if (!subGroups[subGroupKey]) {
            subGroups[subGroupKey] = []
        }
        subGroups[subGroupKey].push({
            ...provider,
            relativeUrl: relativeUrl.replace(subGroupKey + '/', ''),
        })
    })

    return {
        id: baseUrl,
        name: commonPrefix || baseUrl,
        type: 'group',
        expanded: filterApplied,
        emphasize: filterText,
        children: Object.entries(subGroups).map(([key, subGroupProviders]) => {
            if (subGroupProviders.length === 1) {
                return {
                    id: subGroupProviders[0].url,
                    name: key + '/' + subGroupProviders[0].relativeUrl,
                    type: 'url',
                    url: subGroupProviders[0].url,
                    emphasize: subGroupProviders[0].emphasize,
                }
            }
            return {
                id: `${baseUrl}-${key}`,
                name: key,
                type: 'group',
                expanded: false, // Perhaps we want to expand this if there is a matching filter
                emphasize: filterText,
                children: subGroupProviders.map((provider) => ({
                    id: provider.url,
                    name: provider.relativeUrl,
                    type: 'url',
                    url: provider.url,
                    emphasize: provider.emphasize,
                })),
            }
        }),
    }
}

// Set tabindex for each node in the tree with DFS strategy so that the tab
// index is in correct order visually
function addTabIndex(treeData) {
    let index = 0

    function dfs(node) {
        node.tabindex = index++
        if (node.children && node.children.length > 0) {
            node.children.forEach((child) => dfs(child))
        }
    }

    treeData.forEach((node) => dfs(node))
    maxTabIndex.value = index - 1
}

// Watches
watch(
    () => groupedProviders,
    (newGroupedProviders) => {
        treeData.length = 0 // Clear the existing treeData
        Object.entries(newGroupedProviders).forEach(([baseUrl, providers]) => {
            treeData.push(buildTreeNode(baseUrl, providers))
        })
        addTabIndex(treeData)
    }
)

// Lifecycle hooks
onMounted(() => {
    Object.entries(groupedProviders).forEach(([baseUrl, providers]) => {
        treeData.push(buildTreeNode(baseUrl, providers))
    })
    addTabIndex(treeData)
})

// Methods
function toggleNode(node) {
    if (node.type === 'group') {
        node.expanded = !node.expanded
    }
}

function expandNode(node) {
    if (node.type === 'group') {
        node.expanded = true
    }
}

function collapseNode(node) {
    if (node.type === 'group') {
        node.expanded = false
    }
}

function emitProviderSelection(url) {
    emit('chooseProvider', url)
}

function goToPrevious(currentTaxIndex) {
    if (currentTaxIndex === 0) {
        return
    }
    let key = currentTaxIndex - 1
    while (key >= 0) {
        const element = providerList.value.querySelector(`[tabindex="${key}"]`)
        if (element && element.offsetParent !== null) {
            // Check if the element is visible
            element.focus()
            element.scrollIntoView({ behavior: 'smooth', block: 'nearest' }) // Ensure the element is visible
            break
        }
        key--
    }
}

function goToNext(currentTabIndex) {
    if (currentTabIndex >= maxTabIndex.value) {
        return
    }
    let key = currentTabIndex + 1
    while (key <= maxTabIndex.value) {
        const element = providerList.value.querySelector(`[tabindex="${key}"]`)
        if (element && element.offsetParent !== null) {
            // Check if the element is visible
            element.focus()
            element.scrollIntoView({ behavior: 'smooth', block: 'nearest' }) // Ensure the element is visible
            break
        }
        key++
    }
}

function goToFirst() {
    const element = providerList.value.querySelector('[tabindex="0"]')
    if (element) {
        element.focus()
        element.scrollIntoView({ behavior: 'smooth', block: 'nearest' }) // Ensure the element is visible
    }
}

function goToLast() {
    // Find the last shown element, it might be not the maxtabindex (e.g. a group)
    goToPrevious(maxTabIndex.value + 1)
}



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
            <template v-for="node in treeData" :key="node.id">
                <component
                    :is="node.type === 'group' ? 'div' : 'div'"
                    :class="node.type === 'group' ? 'providers-group' : 'providers-list-item'"
                    :data-cy="node.type === 'group' ? 'import-provider-group' : 'import-provider-item'"
                >
                    <div
                        v-if="node.type === 'group'"
                        class="providers-group-header px-2 py-1 text-nowrap"
                        :tabindex="node.tabindex"
                        @click="toggleNode(node)"
                        @keydown.right.prevent="expandNode(node)"
                        @keydown.left.prevent="collapseNode(node)"
                        @keydown.up.prevent="goToPrevious(node.tabindex)"
                        @keydown.down.prevent="goToNext(node.tabindex)"
                        @keydown.home.prevent="goToFirst"
                        @keydown.end.prevent="goToLast"
                        @keydown.esc.prevent="emit('hide')"
                    >
                        <font-awesome-icon
                            :icon="['fas', node.expanded ? 'caret-down' : 'caret-right']"
                        />
                        <TextSearchMarker
                            class="ms-1"
                            :text="node.name"
                            :search="node.emphasize"
                        />
                    </div>
                    <div
                        v-if="node.type === 'group' && node.expanded"
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
                                    :tabindex="child.tabindex"
                                    @click="toggleNode(child)"
                                    @keydown.right.prevent="expandNode(child)"
                                    @keydown.left.prevent="collapseNode(child)"
                                    @keydown.up.prevent="goToPrevious(child.tabindex)"
                                    @keydown.down.prevent="goToNext(child.tabindex)"
                                    @keydown.home.prevent="goToFirst"
                                    @keydown.end.prevent="goToLast"
                                    @keydown.esc.prevent="emit('hide')"
                                >
                                    <font-awesome-icon
                                        :icon="['fas', child.expanded ? 'caret-down' : 'caret-right']"
                                    />
                                    <TextSearchMarker
                                        class="ms-1"
                                        :text="child.name"
                                        :search="child.emphasize"
                                    />
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
                                        :tabindex="grandChild.tabindex"
                                        @click="emitProviderSelection(grandChild.url)"
                                        @keydown.enter.prevent="emitProviderSelection(grandChild.url)"
                                        @keydown.space.prevent="emitProviderSelection(grandChild.url)"
                                        @keydown.up.prevent="goToPrevious(grandChild.tabindex)"
                                        @keydown.down.prevent="goToNext(grandChild.tabindex)"
                                        @keydown.home.prevent="goToFirst"
                                        @keydown.end.prevent="goToLast"
                                        @keydown.esc.prevent="emit('hide')"
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
                                    :tabindex="child.tabindex"
                                    @click="emitProviderSelection(child.url)"
                                    @keydown.enter.prevent="emitProviderSelection(child.url)"
                                    @keydown.space.prevent="emitProviderSelection(child.url)"
                                    @keydown.up.prevent="goToPrevious(child.tabindex)"
                                    @keydown.down.prevent="goToNext(child.tabindex)"
                                    @keydown.home.prevent="goToFirst"
                                    @keydown.end.prevent="goToLast"
                                    @keydown.esc.prevent="emit('hide')"
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
                        :tabindex="node.tabindex"
                        @click="emitProviderSelection(node.url)"
                        @keydown.enter.prevent="emitProviderSelection(node.url)"
                        @keydown.space.prevent="emitProviderSelection(node.url)"
                        @keydown.up.prevent="goToPrevious(node.tabindex)"
                        @keydown.down.prevent="goToNext(node.tabindex)"
                        @keydown.home.prevent="goToFirst"
                        @keydown.end.prevent="goToLast"
                        @keydown.esc.prevent="emit('hide')"
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
// Adjust overflow to ensure focus outline is not clipped
.providers-list-container {
    max-height: 13rem;
    overflow: visible; // Allow focus outline to be fully visible

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
        }
        .providers-group-header:focus,
        .providers-group-header:hover {
            background-color: $list-item-hover-bg-color;
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
        }
        .providers-sub-group-header:focus,
        .providers-sub-group-header:hover {
            background-color: $list-item-hover-bg-color;
        }

        .providers-sub-group-items {
            padding-left: 1rem;
        }
    }
}
</style>
