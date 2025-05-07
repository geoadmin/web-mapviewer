<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'

import { MAP_VIEWS } from '@/router/viewNames'
import SimpleWindow from '@/utils/components/SimpleWindow.vue'

const router = useRouter()

const views = MAP_VIEWS
const currentView = computed(() => router.currentRoute.value.name)

function onRouteChange(routeName) {
    router.push({
        name: routeName,
        replace: true,
    })
}
</script>

<template>
    <SimpleWindow
        title="View selector"
        movable
        initial-position="top-left"
    >
        <div class="btn-group">
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
    </SimpleWindow>
</template>
