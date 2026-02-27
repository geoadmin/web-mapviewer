<script setup lang="ts">
import log from '@swissgeo/log'
import { computed } from 'vue'
import { useRouter } from 'vue-router'

import { MAP_VIEWS } from '@/router/viewNames.js'

const router = useRouter()

const views = MAP_VIEWS
const currentView = computed(() => router.currentRoute.value.name)

function onRouteChange(routeName: string) {
    router
        .push({
            name: routeName,
            replace: true,
        })
        .catch((error) => {
            log.error({
                title: 'DebugViewSelector.vue',
                messages: ['Failed to change view', error],
            })
        })
}
</script>

<template>
    <div class="btn-group btn-group-sm">
        <template
            v-for="name in views"
            :key="name"
        >
            <input
                type="radio"
                class="btn-check"
                :name="name"
                :checked="name === currentView"
            />
            <label
                class="btn btn-outline-secondary"
                :for="name"
                @click="onRouteChange(name)"
            >
                {{ name.replace('View', '') }}
            </label>
        </template>
    </div>
</template>
