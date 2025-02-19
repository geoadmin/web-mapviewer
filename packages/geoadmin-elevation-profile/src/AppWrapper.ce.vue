<script setup lang="ts">
import type { SingleCoordinate } from '@geoadmin/coordinates'

import ElevationProfile from '@/ElevationProfile.ce.vue'
import I18nHost from '@/I18nHost.ce.vue'

interface AppProps {
    locale?: 'en' | 'de' | 'fr' | 'it' | 'rm'
    points: SingleCoordinate[]
    projection?: string
}

const { locale = 'en', points, projection = 'EPSG:2056' } = defineProps<AppProps>()
</script>

<template>
    <I18nHost :locale="locale">
        <ElevationProfile
            :points="points"
            :projection="projection"
        />
    </I18nHost>
</template>
