<script setup>
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { reactive, watch, ref, onMounted } from 'vue'
import { useTemplateRef } from 'vue'

import TextSearchMarker from '@/utils/components/TextSearchMarker.vue'
import { getLongestCommonPrefix } from '@/utils/utils.js'

/** @enum */
const NodeType = {
    GROUP: 'group',
    SUBGROUP: 'sub-group',
    URL: 'url',
}

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
 * @property {NodeType} type - The type of the node (e.g. `'group'`, `'url'`).
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
 * This function creates a hierarchical structure of nodes. If there is only one provider, it
 * returns a URL node. If there are multiple providers, it groups them by their common prefix and
 * creates a group node with sub-group nodes for each unique prefix.
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
            type: NodeType.URL,
            url: providers[0].url,
            emphasize: providers[0].emphasize,
        }
    }

    const urls = providers.map((provider) => provider.url)
    const commonPrefix = getLongestCommonPrefix(urls)
    const subGroups = {}

    providers.forEach((provider) => {
        const relativeUrl = provider.htmlDisplay.replace(commonPrefix ?? baseUrl, '')
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
        name: commonPrefix ?? baseUrl,
        type: NodeType.GROUP,
        expanded: filterApplied,
        emphasize: filterText,
        children: Object.entries(subGroups).map(([key, subGroupProviders]) => {
            if (subGroupProviders.length === 1) {
                return {
                    id: subGroupProviders[0].url,
                    name: `${key}/${subGroupProviders[0].relativeUrl}`,
                    type: NodeType.URL,
                    url: subGroupProviders[0].url,
                    emphasize: subGroupProviders[0].emphasize,
                }
            }
            return {
                id: `${baseUrl}-${key}`,
                name: key,
                type: NodeType.SUBGROUP,
                expanded: false, // Perhaps we want to expand this if there is a matching filter
                emphasize: filterText,
                children: subGroupProviders.map((provider) => ({
                    id: provider.url,
                    name: provider.relativeUrl,
                    type: NodeType.URL,
                    url: provider.url,
                    emphasize: provider.emphasize,
                })),
            }
        }),
    }
}

/**
 * Assigns a `tabindex` property to each node in the tree data using a Depth-First Search (DFS)
 * strategy. This ensures that the tab order matches the visual order of the nodes.
 *
 * @param {ProviderTreeNode[]} treeData - The tree data containing nodes to which `tabindex` will be
 *   assigned.
 */
function addTabIndex(treeData) {
    let currentIndex = 0

    treeData.forEach((node) => {
        currentIndex = assignTabIndex(node, currentIndex)
    })

    maxTabIndex.value = currentIndex - 1
}

/**
 * Recursively assigns `tabindex` properties to a node and its children.
 *
 * @param {ProviderTreeNode} node - The current node to process.
 * @param {number} startIndex - The starting index for the current node.
 * @returns {number} The next available index after processing the node and its children.
 */
function assignTabIndex(node, startIndex) {
    node.tabindex = startIndex++
    if (node.children && node.children.length > 0) {
        node.children.forEach((child) => {
            startIndex = assignTabIndex(child, startIndex)
        })
    }
    return startIndex
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
    if (node.type === NodeType.GROUP || node.type === NodeType.SUBGROUP) {
        node.expanded = !node.expanded
    }
}

function expandNode(node) {
    if (node.type === NodeType.GROUP || node.type === NodeType.SUBGROUP) {
        node.expanded = true
    }
}

function collapseNode(node) {
    if (node.type === NodeType.GROUP || node.type === NodeType.SUBGROUP) {
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
            data-cy="import-provider-list"
        >
            <template
                v-for="node in treeData"
                :key="node.id"
            >
                <!-- The first level container  -->
                <div :data-cy="`import-provider-${node.type}`">
                    <div
                        v-if="node.type === NodeType.GROUP"
                        class="providers-header px-2 py-1 text-nowrap cursor-pointer fw-bold position-sticky top-0 z-2 w-100"
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
                        v-if="node.type === NodeType.GROUP && node.expanded"
                        class="ps-2 ms-3"
                    >
                        <template
                            v-for="child in node.children"
                            :key="child.id"
                        >
                            <!-- The second level container  -->
                            <div :data-cy="`import-provider-${child.type}`">
                                <div
                                    v-if="child.type === NodeType.SUBGROUP"
                                    class="providers-header px-2 py-1 text-nowrap cursor-pointer fw-bold position-sticky top-3 z-1 w-100"
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
                                        :icon="[
                                            'fas',
                                            child.expanded ? 'caret-down' : 'caret-right',
                                        ]"
                                    />
                                    <TextSearchMarker
                                        class="ms-1"
                                        :text="child.name"
                                        :search="child.emphasize"
                                    />
                                </div>
                                <div
                                    v-if="child.type === NodeType.SUBGROUP && child.expanded"
                                    class="ps-2 ms-3 cursor-pointer"
                                >
                                    <div
                                        v-for="grandChild in child.children"
                                        :key="grandChild.id"
                                        class="px-2 py-1 text-nowrap providers-item"
                                        data-cy="import-provider-item"
                                        :tabindex="grandChild.tabindex"
                                        @click="emitProviderSelection(grandChild.url)"
                                        @keydown.enter.prevent="
                                            emitProviderSelection(grandChild.url)
                                        "
                                        @keydown.space.prevent="
                                            emitProviderSelection(grandChild.url)
                                        "
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
                                    v-else-if="child.type === NodeType.URL"
                                    class="px-2 py-1 text-nowrap cursor-pointer providers-item"
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
                            </div>
                        </template>
                    </div>
                    <div
                        v-else-if="node.type === NodeType.URL"
                        class="px-2 py-1 text-nowrap cursor-pointer providers-item"
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
                </div>
            </template>
            <div
                v-show="treeData.length === 0"
                class="px-2 py-1 user-select-none"
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

    .providers-header {
        background-color: $body-bg; // Ensure it matches the background, the bootstrap bg-body does not work with the focus/hover
    }

    .providers-item:focus,
    .providers-item:hover,
    .providers-header:focus,
    .providers-header:hover {
        background-color: $list-item-hover-bg-color;
    }
}
</style>
