<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'

import { MAP_VIEWS } from '@/router/viewNames'

const router = useRouter()

const views = MAP_VIEWS
const currentView = computed(() => router.currentRoute.value.name)
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
            >
            <label
                class="btn btn-outline-secondary"
                :for="name"
                @click="
                    router.push({
                        name,
                        params: {
                            layout: 'A4',
                            orientation: 'landscape',
                        },
                    })
                "
            >
                {{ name.replace('View', '') }}
            </label>
        </template>
    </div>
</template>
