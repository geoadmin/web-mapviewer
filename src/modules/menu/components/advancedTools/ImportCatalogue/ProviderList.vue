<script setup>
import { ref, toRefs } from 'vue'

import TextSearchMarker from '@/utils/components/TextSearchMarker.vue'

const props = defineProps({
    showProviders: {
        type: Boolean,
        default: false,
    },
    providers: {
        type: Array /* Array of Provider */,
        default() {
            return []
        },
    },
})

const emit = defineEmits(['chooseProvider'])

const { showProviders, providers } = toRefs(props)
const providerList = ref(null)

function goToPrevious(currentKey) {
    if (currentKey === 0) {
        return
    }
    const key = currentKey - 1
    providerList.value.querySelector(`[tabindex="${key}"]`).focus()
}

function goToNext(currentKey) {
    if (currentKey >= providers.value.length - 1) {
        return
    }
    const key = currentKey + 1
    providerList.value.querySelector(`[tabindex="${key}"]`).focus()
}

function goToFirst() {
    providerList.value.querySelector('[tabindex="0"]').focus()
}

function goToLast() {
    providerList.value.querySelector(`[tabindex="${providers.value.length - 1}"]`).focus()
}

defineExpose({ goToFirst })
</script>

<template>
    <div
        v-show="showProviders"
        class="providers-list-container shadow border rounded-bottom overflow-auto"
    >
        <div ref="providerList" class="providers-list" data-cy="import-provider-list">
            <div
                v-for="(provider, key) in providers"
                :key="provider"
                :tabindex="key"
                class="providers-list-item px-2 py-1 text-nowrap"
                @keydown.up.prevent="goToPrevious(key)"
                @keydown.down.prevent="() => goToNext(key)"
                @keydown.home.prevent="goToFirst"
                @keydown.end.prevent="goToLast"
                @keydown.esc.prevent="showProviders = false"
                @keydown.enter.prevent="emit('chooseProvider', provider.url)"
                @click="emit('chooseProvider', provider.url)"
            >
                <TextSearchMarker :text="provider.htmlDisplay" :search="provider.emphasize" />
            </div>
            <div v-show="providers.length === 0" class="providers-list-empty px-2 py-1">
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
    }
}
</style>
