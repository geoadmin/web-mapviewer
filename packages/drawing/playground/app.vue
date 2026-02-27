<script setup lang="ts">
import { registerProj4 } from '@swissgeo/coordinates'
import log, { LogLevel } from '@swissgeo/log'
import { register } from 'ol/proj/proj4'
import proj4 from 'proj4'
import 'ol/ol.css'

registerProj4(proj4)
register(proj4)

log.wantedLevels = [LogLevel.Debug, LogLevel.Info, LogLevel.Warn, LogLevel.Error]
</script>

<template>
    <UApp>
        <NuxtPage />
    </UApp>
</template>
