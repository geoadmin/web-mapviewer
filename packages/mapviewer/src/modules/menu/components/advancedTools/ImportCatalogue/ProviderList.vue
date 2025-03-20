<script setup>
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { ref, computed } from 'vue'
import { useTemplateRef } from 'vue'

import TextSearchMarker from '@/utils/components/TextSearchMarker.vue'

const { showProviders, groupedProviders } = defineProps({
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
            <div
                v-for="(providers, baseUrl) in groupedProviders"
                :key="baseUrl"
                class="providers-group"
            >
                <div
                    class="providers-group-header px-2 py-1 text-nowrap"
                    @click="toggleGroup(baseUrl)"
                >
                    <font-awesome-icon :icon="['fas', titleCaretIcon(baseUrl)]" />
                    <span class="ms-1">{{ baseUrl }}</span>
                </div>
                <div
                    v-show="expandedGroups[baseUrl]"
                    class="providers-group-items ms-3"
                >
                    <div
                        v-for="(provider, key) in providers"
                        :key="provider.url"
                        :tabindex="key"
                        class="providers-list-item px-2 py-1 text-nowrap"
                        @keydown.up.prevent="goToPrevious(key)"
                        @keydown.down.prevent="() => goToNext(key)"
                        @keydown.home.prevent="goToFirst"
                        @keydown.end.prevent="goToLast"
                        @keydown.esc.prevent="emit('hide')"
                        @keydown.enter.prevent="emit('chooseProvider', provider.url)"
                        @click="emit('chooseProvider', provider.url)"
                    >
                        <TextSearchMarker
                            :text="provider.htmlDisplay"
                            :search="provider.emphasize"
                        />
                    </div>
                </div>
            </div>
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
        }

        .providers-group-items {
            padding-left: 1rem;
        }
    }
}
</style>
