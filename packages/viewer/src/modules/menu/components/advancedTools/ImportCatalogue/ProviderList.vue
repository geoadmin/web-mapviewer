<script setup lang="ts">
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { reactive, watch, ref, onMounted } from 'vue'
import { useTemplateRef } from 'vue'

import TextSearchMarker from '@/utils/components/TextSearchMarker.vue'
import { getLongestCommonPrefix } from '@/utils/utils'
import { NodeType } from '@/modules/menu/components/advancedTools/ImportCatalogue/NodeType.enum'

interface Provider {
    url: string
    htmlDisplay: string
    emphasize: string
    relativeUrl?: string
}

interface ProviderTreeNode {
    id: string
    name: string
    type: NodeType
    url?: string
    emphasize: string
    expanded?: boolean
    children?: ProviderTreeNode[]
    tabindex?: number
}

const { showProviders, groupedProviders, filterApplied, filterText } = defineProps<{
    showProviders?: boolean
    groupedProviders?: Record<string, Provider[]>
    filterApplied?: boolean
    filterText?: string
}>()

// reactive data
const emit = defineEmits<{
    chooseProvider: [url: string]
    hide: []
}>()
const providerList = useTemplateRef<HTMLDivElement>('providerList')
const maxTabIndex = ref(0)
const treeData = reactive<ProviderTreeNode[]>([])

// Helper to safely get tabindex value
function getTabIndex(node: ProviderTreeNode): number {
    return node.tabindex ?? 0
}

/**
 * Builds a tree node structure from a base URL and an array of providers.
 *
 * This function creates a hierarchical structure of nodes. If there is only one provider, it
 * returns a URL node. If there are multiple providers, it groups them by their common prefix and
 * creates a group node with sub-group nodes for each unique prefix.
 */
function buildTreeNode(baseUrl: string, providers: Provider[]): ProviderTreeNode {
    const firstProvider = providers[0]
    if (providers.length === 1 && firstProvider) {
        return {
            id: baseUrl,
            name: firstProvider.htmlDisplay,
            type: NodeType.Url,
            url: firstProvider.url,
            emphasize: firstProvider.emphasize,
        }
    }

    const urls = providers.map((provider) => provider.url)
    const commonPrefix = getLongestCommonPrefix(urls)
    const subGroups: Record<string, Provider[]> = {}

    providers.forEach((provider) => {
        const relativeUrl = provider.htmlDisplay.replace(commonPrefix ?? baseUrl, '')
        // We group by the first part of the relative URL (good enough for our cases)
        const subGroupKey = relativeUrl.split('/')[0]

        if (subGroupKey && !subGroups[subGroupKey]) {
            subGroups[subGroupKey] = []
        }
        if (subGroupKey && subGroups[subGroupKey]) {
            subGroups[subGroupKey].push({
                ...provider,
                relativeUrl: relativeUrl.replace(subGroupKey + '/', ''),
            })
        }
    })

    return {
        id: baseUrl,
        name: commonPrefix ?? baseUrl,
        type: NodeType.Group,
        expanded: filterApplied,
        emphasize: filterText ?? '',
        children: Object.entries(subGroups).map(([key, subGroupProviders]) => {
            const firstSubProvider = subGroupProviders[0]
            if (subGroupProviders.length === 1 && firstSubProvider) {
                return {
                    id: firstSubProvider.url,
                    name: `${key}/${firstSubProvider.relativeUrl}`,
                    type: NodeType.Url,
                    url: firstSubProvider.url,
                    emphasize: firstSubProvider.emphasize,
                }
            }
            return {
                id: `${baseUrl}-${key}`,
                name: key,
                type: NodeType.SubGroup,
                expanded: false,
                emphasize: filterText ?? '',
                children: subGroupProviders.map((provider) => ({
                    id: provider.url,
                    name: provider.relativeUrl ?? '',
                    type: NodeType.Url,
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
 */
function addTabIndex(treeData: ProviderTreeNode[]) {
    let currentIndex = 0

    treeData.forEach((node) => {
        currentIndex = assignTabIndex(node, currentIndex)
    })

    maxTabIndex.value = currentIndex - 1
}

/** Recursively assigns `tabindex` properties to a node and its children. */
function assignTabIndex(node: ProviderTreeNode, startIndex: number): number {
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
        if (!newGroupedProviders) return
        treeData.length = 0 // Clear the existing treeData
        Object.entries(newGroupedProviders).forEach(([baseUrl, providers]) => {
            treeData.push(buildTreeNode(baseUrl, providers))
        })
        addTabIndex(treeData)
    }
)

// Lifecycle hooks
onMounted(() => {
    if (groupedProviders) {
        Object.entries(groupedProviders).forEach(([baseUrl, providers]) => {
            treeData.push(buildTreeNode(baseUrl, providers))
        })
        addTabIndex(treeData)
    }
})

// Methods
function toggleNode(node: ProviderTreeNode) {
    if (node.type === NodeType.Group || node.type === NodeType.SubGroup) {
        node.expanded = !node.expanded
    }
}

function expandNode(node: ProviderTreeNode) {
    if (node.type === NodeType.Group || node.type === NodeType.SubGroup) {
        node.expanded = true
    }
}

function collapseNode(node: ProviderTreeNode) {
    if (node.type === NodeType.Group || node.type === NodeType.SubGroup) {
        node.expanded = false
    }
}

function emitProviderSelection(url?: string) {
    if (url) {
        emit('chooseProvider', url)
    }
}

function goToPrevious(currentTaxIndex: number) {
    if (currentTaxIndex === 0) {
        return
    }
    let key = currentTaxIndex - 1
    while (key >= 0) {
        const element = providerList.value?.querySelector(`[tabindex="${key}"]`) as HTMLElement
        if (element && element.offsetParent !== null) {
            // Check if the element is visible
            element.focus()
            element.scrollIntoView({ behavior: 'smooth', block: 'nearest' }) // Ensure the element is visible
            break
        }
        key--
    }
}

function goToNext(currentTabIndex: number) {
    if (currentTabIndex >= maxTabIndex.value) {
        return
    }
    let key = currentTabIndex + 1
    while (key <= maxTabIndex.value) {
        const element = providerList.value?.querySelector(`[tabindex="${key}"]`) as HTMLElement
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
    const element = providerList.value?.querySelector('[tabindex="0"]') as HTMLElement
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
        class="providers-list-container rounded-bottom overflow-auto border shadow"
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
                        v-if="node.type === NodeType.Group"
                        class="providers-header fw-bold position-sticky top-0 z-2 w-100 cursor-pointer px-2 py-1 text-nowrap"
                        :tabindex="getTabIndex(node)"
                        @click="toggleNode(node)"
                        @keydown.right.prevent="expandNode(node)"
                        @keydown.left.prevent="collapseNode(node)"
                        @keydown.up.prevent="goToPrevious(getTabIndex(node))"
                        @keydown.down.prevent="goToNext(getTabIndex(node))"
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
                        v-if="node.type === NodeType.Group && node.expanded"
                        class="ms-3 ps-2"
                    >
                        <template
                            v-for="child in node.children"
                            :key="child.id"
                        >
                            <!-- The second level container  -->
                            <div :data-cy="`import-provider-${child.type}`">
                                <div
                                    v-if="child.type === NodeType.SubGroup"
                                    class="providers-header fw-bold position-sticky top-3 z-1 w-100 cursor-pointer px-2 py-1 text-nowrap"
                                    :tabindex="getTabIndex(child)"
                                    @click="toggleNode(child)"
                                    @keydown.right.prevent="expandNode(child)"
                                    @keydown.left.prevent="collapseNode(child)"
                                    @keydown.up.prevent="goToPrevious(getTabIndex(child))"
                                    @keydown.down.prevent="goToNext(getTabIndex(child))"
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
                                    v-if="child.type === NodeType.SubGroup && child.expanded"
                                    class="ms-3 cursor-pointer ps-2"
                                >
                                    <div
                                        v-for="grandChild in child.children"
                                        :key="grandChild.id"
                                        class="providers-item px-2 py-1 text-nowrap"
                                        data-cy="import-provider-item"
                                        :tabindex="getTabIndex(grandChild)"
                                        @click="emitProviderSelection(grandChild.url)"
                                        @keydown.enter.prevent="
                                            emitProviderSelection(grandChild.url)
                                        "
                                        @keydown.space.prevent="
                                            emitProviderSelection(grandChild.url)
                                        "
                                        @keydown.up.prevent="goToPrevious(getTabIndex(grandChild))"
                                        @keydown.down.prevent="goToNext(getTabIndex(grandChild))"
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
                                    v-else-if="child.type === NodeType.Url"
                                    class="providers-item cursor-pointer px-2 py-1 text-nowrap"
                                    data-cy="import-provider-item"
                                    :tabindex="getTabIndex(child)"
                                    @click="emitProviderSelection(child.url)"
                                    @keydown.enter.prevent="emitProviderSelection(child.url)"
                                    @keydown.space.prevent="emitProviderSelection(child.url)"
                                    @keydown.up.prevent="goToPrevious(getTabIndex(child))"
                                    @keydown.down.prevent="goToNext(getTabIndex(child))"
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
                        v-else-if="node.type === NodeType.Url"
                        class="providers-item cursor-pointer px-2 py-1 text-nowrap"
                        data-cy="import-provider-item"
                        :tabindex="getTabIndex(node)"
                        @click="emitProviderSelection(node.url)"
                        @keydown.enter.prevent="emitProviderSelection(node.url)"
                        @keydown.space.prevent="emitProviderSelection(node.url)"
                        @keydown.up.prevent="goToPrevious(getTabIndex(node))"
                        @keydown.down.prevent="goToNext(getTabIndex(node))"
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
                class="user-select-none px-2 py-1"
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
