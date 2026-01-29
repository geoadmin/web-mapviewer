<script setup lang="ts">
import { useTemplateRef } from 'vue'

import SwissGeoTooltip from '@/SwissGeoTooltip.vue'

const manualTooltipRef = useTemplateRef<InstanceType<typeof SwissGeoTooltip>>('manualTooltip')

function toggleManualTooltip() {
    if (manualTooltipRef.value?.isOpen) {
        manualTooltipRef.value?.closeTooltip()
    } else {
        manualTooltipRef.value?.openTooltip()
    }
}
</script>

<template>
    <div class="p-4">
        <strong class="text-2xl">Themes</strong>
        <div class="my-2 grid grid-cols-3 justify-items-center gap-3">
            <SwissGeoTooltip tooltip-content="Default theme">
                <span>Default theme</span>
            </SwissGeoTooltip>
            <SwissGeoTooltip
                tooltip-content="Light theme"
                theme="light"
            >
                <span>Light theme</span>
            </SwissGeoTooltip>
            <SwissGeoTooltip
                tooltip-content="Secondary theme"
                theme="secondary"
            >
                <span>Secondary theme</span>
            </SwissGeoTooltip>
            <SwissGeoTooltip
                tooltip-content="Warning theme"
                theme="warning"
            >
                <span>Warning theme</span>
            </SwissGeoTooltip>
            <SwissGeoTooltip
                tooltip-content="Danger theme"
                theme="danger"
            >
                <span>Danger theme</span>
            </SwissGeoTooltip>
        </div>
        <strong class="text-2xl">Placements</strong>
        <div class="my-2 grid grid-cols-4 justify-items-center gap-3">
            <SwissGeoTooltip
                tooltip-content="Top placement"
                placement="top"
                theme="light"
            >
                Top placement (light)
            </SwissGeoTooltip>
            <SwissGeoTooltip
                tooltip-content="Top placement"
                placement="top"
                theme="secondary"
            >
                Top placement (secondary)
            </SwissGeoTooltip>
            <SwissGeoTooltip
                tooltip-content="Top placement"
                placement="top"
                theme="warning"
            >
                Top placement (warning)
            </SwissGeoTooltip>
            <SwissGeoTooltip
                tooltip-content="Top placement"
                placement="top"
                theme="danger"
            >
                Top placement (danger)
            </SwissGeoTooltip>
            <SwissGeoTooltip
                tooltip-content="Bottom placement"
                placement="bottom"
                theme="light"
            >
                Bottom placement (light)
            </SwissGeoTooltip>
            <SwissGeoTooltip
                tooltip-content="Bottom placement"
                placement="bottom"
                theme="secondary"
            >
                Bottom placement (secondary)
            </SwissGeoTooltip>
            <SwissGeoTooltip
                tooltip-content="Bottom placement"
                placement="bottom"
                theme="warning"
            >
                Bottom placement (warning)
            </SwissGeoTooltip>
            <SwissGeoTooltip
                tooltip-content="Bottom placement"
                placement="bottom"
                theme="danger"
            >
                Bottom placement (danger)
            </SwissGeoTooltip>
            <SwissGeoTooltip
                tooltip-content="Left placement"
                placement="left"
                theme="light"
            >
                Left placement (light)
            </SwissGeoTooltip>
            <SwissGeoTooltip
                tooltip-content="Left placement"
                placement="left"
                theme="secondary"
            >
                Left placement (secondary)
            </SwissGeoTooltip>
            <SwissGeoTooltip
                tooltip-content="Left placement"
                placement="left"
                theme="warning"
            >
                Left placement (warning)
            </SwissGeoTooltip>
            <SwissGeoTooltip
                tooltip-content="Left placement"
                placement="left"
                theme="danger"
            >
                Left placement (danger)
            </SwissGeoTooltip>
            <SwissGeoTooltip
                tooltip-content="Right placement"
                placement="right"
                theme="light"
            >
                Right placement (light)
            </SwissGeoTooltip>
            <SwissGeoTooltip
                tooltip-content="Right placement"
                placement="right"
                theme="secondary"
            >
                Right placement (secondary)
            </SwissGeoTooltip>
            <SwissGeoTooltip
                tooltip-content="Right placement"
                placement="right"
                theme="warning"
            >
                Right placement (warning)
            </SwissGeoTooltip>
            <SwissGeoTooltip
                tooltip-content="Right placement"
                placement="right"
                theme="danger"
            >
                Right placement (danger)
            </SwissGeoTooltip>
        </div>
        <strong
            class="text-2xl"
            @click="toggleManualTooltip"
        >
            Triggers
        </strong>
        <div class="my-2 grid grid-cols-3 justify-items-center gap-3">
            <SwissGeoTooltip tooltip-content="Default trigger"> Default trigger </SwissGeoTooltip>
            <SwissGeoTooltip
                tooltip-content="Hover trigger"
                open-trigger="hover"
            >
                Hover trigger
            </SwissGeoTooltip>
            <SwissGeoTooltip
                tooltip-content="Click trigger"
                open-trigger="click"
            >
                Click trigger
            </SwissGeoTooltip>
            <SwissGeoTooltip
                ref="manualTooltip"
                tooltip-content="Click again on the section's title to hide it"
                open-trigger="manual"
            >
                Manual trigger (click on section title to open)
            </SwissGeoTooltip>
        </div>
    </div>
</template>
