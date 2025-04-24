<script setup>
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { reactive, watch, ref } from 'vue'
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

const maxtabindex = ref(0)


function goToPrevious(tabindex) {
    if (tabindex === 0) {
        return
    }
    let key = tabindex - 1;
    while (key >= 0) {
        const element = providerList.value.querySelector(`[tabindex="${key}"]`);
        if (element && element.offsetParent !== null) { // Check if the element is visible
            element.focus();
            element.scrollIntoView({ behavior: 'smooth', block: 'nearest' }); // Ensure the element is visible
            break;
        }
        key--;
    }
}

function goToNext(tabindex) {
    if (tabindex >= maxtabindex.value) {
        return
    }
    let key = tabindex + 1;
    while (key <= maxtabindex.value) {
        const element = providerList.value.querySelector(`[tabindex="${key}"]`);
        if (element && element.offsetParent !== null) { // Check if the element is visible
            element.focus();
            element.scrollIntoView({ behavior: 'smooth', block: 'nearest' }); // Ensure the element is visible
            break;
        }
        key++;
    }
}

function goToFirst() {
    const element = providerList.value.querySelector('[tabindex="0"]')
    if (element) {
        element.focus();
        element.scrollIntoView({ behavior: 'smooth', block: 'nearest' }); // Ensure the element is visible
    }
}

function goToLast() {
    // Find the last shown element, it might be not the maxtabindex (e.g. a group)
    goToPrevious(maxtabindex.value + 1)
}

defineExpose({ goToFirst })

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
            name: providers[0].htmlDisplay,
            type: 'url',
            url: providers[0].url,
            emphasize: providers[0].emphasize,
        };
    }

    const urls = providers.map((provider) => provider.url);
    const commonPrefix = getLongestCommonPrefix(urls);
    const subGroups = {};

    providers.forEach((provider) => {
        const relativeUrl = provider.htmlDisplay.replace(commonPrefix || baseUrl, '');
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

function addtabindex(treeData) {
    let index = 0;

    function dfs(node) {
        node.tabindex = index++;
        if (node.children && node.children.length > 0) {
            node.children.forEach(child => dfs(child));
        }
    }

    treeData.forEach(node => dfs(node));
    maxtabindex.value = index - 1;
}

Object.entries(groupedProviders).forEach(([baseUrl, providers]) => {
    treeData.push(buildTreeNode(baseUrl, providers));
});
addtabindex(treeData);

watch(() => groupedProviders, (newGroupedProviders) => {
    treeData.length = 0; // Clear the existing treeData
    Object.entries(newGroupedProviders).forEach(([baseUrl, providers]) => {
        treeData.push(buildTreeNode(baseUrl, providers));
    })
    addtabindex(treeData);
});

function toggleNode(node) {
    if (node.type === 'group') {
        node.expanded = !node.expanded;
    }
}

function expandNode(node) {
    if (node.type === 'group') {
        node.expanded = true;
    }
}

function collapseNode(node) {
    if (node.type === 'group') {
        node.expanded = false;
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

                >
                    <div
                        v-if="node.type === 'group'"
                        class="providers-group-header px-2 py-1 text-nowrap"
                        :tabindex="node.tabindex"
                        @click="toggleNode(node)"
                        @keydown.right.prevent="expandNode(node)"
                        @keydown.left.prevent="collapseNode(node)"
                        @keydown.up.prevent="goToPrevious(node.tabindex)"
                        @keydown.down.prevent="() => goToNext(node.tabindex)"
                        @keydown.home.prevent="goToFirst"
                        @keydown.end.prevent="goToLast"
                        @keydown.esc.prevent="emit('hide')"
                    >
                        <font-awesome-icon :icon="['fas', node.expanded ? 'caret-down' : 'caret-right']" />
                        <span class="ms-1">{{ node.name }}</span>
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
                                    @keydown.down.prevent="() => goToNext(child.tabindex)"
                                    @keydown.home.prevent="goToFirst"
                                    @keydown.end.prevent="goToLast"
                                    @keydown.esc.prevent="emit('hide')"
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
                                        :tabindex="grandChild.tabindex"
                                        @click="emitProviderSelection(grandChild.url)"
                                        @keydown.enter.prevent="emitProviderSelection(grandChild.url)"
                                        @keydown.up.prevent="goToPrevious(grandChild.tabindex)"
                                        @keydown.down.prevent="() => goToNext(grandChild.tabindex)"
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
                                    @keydown.up.prevent="goToPrevious(child.tabindex)"
                                    @keydown.down.prevent="() => goToNext(child.tabindex)"
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
                        @keydown.up.prevent="goToPrevious(node.tabindex)"
                        @keydown.down.prevent="() => goToNext(node.tabindex)"
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
