<script setup lang="ts">
import type { NavigationMenuItem } from '@nuxt/ui'

import { useRoute } from '#app'
import { computed } from 'vue'

const route = useRoute()

const devPages = computed<NavigationMenuItem[]>(() => [
    {
        label: 'Button',
        to: '/',
        active: route.path === '/',
    },
    {
        label: 'Modal',
        to: '/modal',
        active: route.path.startsWith('/modal'),
    },
    {
        label: 'Tooltip',
        to: '/tooltip',
        active: route.path.startsWith('/tooltip'),
    },
])
</script>

<template>
    <UApp>
        <UHeader title="@swissgeo/components dev page">
            <UNavigationMenu :items="devPages" />
        </UHeader>
        <UContainer>
            <NuxtPage />
        </UContainer>
    </UApp>
</template>
