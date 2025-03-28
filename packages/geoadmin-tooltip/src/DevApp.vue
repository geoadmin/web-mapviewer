<script setup lang="ts">
import { useTemplateRef } from 'vue'

import GeoadminTooltip from '@/GeoadminTooltip.vue'

const manualTooltip = useTemplateRef('manualTooltip')

function toggleManualTooltip() {
    if (manualTooltip.value?.isOpen) {
        manualTooltip.value?.closeTooltip()
    } else {
        manualTooltip.value?.openTooltip()
    }
}
</script>

<template>
    <div class="tw:p-4">
        <strong class="tw:text-2xl">Themes</strong>
        <div class="tw:my-2 tw:grid tw:grid-cols-3 tw:gap-3 tw:justify-items-center">
            <GeoadminTooltip tooltip-content="Default theme">
                <span>Default theme</span>
            </GeoadminTooltip>
            <GeoadminTooltip
                tooltip-content="Light theme"
                theme="light"
            >
                <span>Light theme</span>
            </GeoadminTooltip>
            <GeoadminTooltip
                tooltip-content="Secondary theme"
                theme="secondary"
            >
                <span>Secondary theme</span>
            </GeoadminTooltip>
            <GeoadminTooltip
                tooltip-content="Warning theme"
                theme="warning"
            >
                <span>Warning theme</span>
            </GeoadminTooltip>
            <GeoadminTooltip
                tooltip-content="Danger theme"
                theme="danger"
            >
                <span>Danger theme</span>
            </GeoadminTooltip>
        </div>
        <strong class="tw:text-2xl">Placements</strong>
        <div class="tw:my-2 tw:grid tw:grid-cols-4 tw:gap-3 tw:justify-items-center">
            <GeoadminTooltip
                tooltip-content="Top placement"
                placement="top"
                theme="light"
            >
                Top placement (light)
            </GeoadminTooltip>
            <GeoadminTooltip
                tooltip-content="Top placement"
                placement="top"
                theme="secondary"
            >
                Top placement (secondary)
            </GeoadminTooltip>
            <GeoadminTooltip
                tooltip-content="Top placement"
                placement="top"
                theme="warning"
            >
                Top placement (warning)
            </GeoadminTooltip>
            <GeoadminTooltip
                tooltip-content="Top placement"
                placement="top"
                theme="danger"
            >
                Top placement (danger)
            </GeoadminTooltip>
            <GeoadminTooltip
                tooltip-content="Bottom placement"
                placement="bottom"
                theme="light"
            >
                Bottom placement (light)
            </GeoadminTooltip>
            <GeoadminTooltip
                tooltip-content="Bottom placement"
                placement="bottom"
                theme="secondary"
            >
                Bottom placement (secondary)
            </GeoadminTooltip>
            <GeoadminTooltip
                tooltip-content="Bottom placement"
                placement="bottom"
                theme="warning"
            >
                Bottom placement (warning)
            </GeoadminTooltip>
            <GeoadminTooltip
                tooltip-content="Bottom placement"
                placement="bottom"
                theme="danger"
            >
                Bottom placement (danger)
            </GeoadminTooltip>
            <GeoadminTooltip
                tooltip-content="Left placement"
                placement="left"
                theme="light"
            >
                Left placement (light)
            </GeoadminTooltip>
            <GeoadminTooltip
                tooltip-content="Left placement"
                placement="left"
                theme="secondary"
            >
                Left placement (secondary)
            </GeoadminTooltip>
            <GeoadminTooltip
                tooltip-content="Left placement"
                placement="left"
                theme="warning"
            >
                Left placement (warning)
            </GeoadminTooltip>
            <GeoadminTooltip
                tooltip-content="Left placement"
                placement="left"
                theme="danger"
            >
                Left placement (danger)
            </GeoadminTooltip>
            <GeoadminTooltip
                tooltip-content="Right placement"
                placement="right"
                theme="light"
            >
                Right placement (light)
            </GeoadminTooltip>
            <GeoadminTooltip
                tooltip-content="Right placement"
                placement="right"
                theme="secondary"
            >
                Right placement (secondary)
            </GeoadminTooltip>
            <GeoadminTooltip
                tooltip-content="Right placement"
                placement="right"
                theme="warning"
            >
                Right placement (warning)
            </GeoadminTooltip>
            <GeoadminTooltip
                tooltip-content="Right placement"
                placement="right"
                theme="danger"
            >
                Right placement (danger)
            </GeoadminTooltip>
        </div>
        <strong
            class="tw:text-2xl"
            @click="toggleManualTooltip"
        >
            Triggers
        </strong>
        <div class="tw:my-2 tw:grid tw:grid-cols-3 tw:gap-3 tw:justify-items-center">
            <GeoadminTooltip tooltip-content="Default trigger"> Default trigger </GeoadminTooltip>
            <GeoadminTooltip
                tooltip-content="Hover trigger"
                open-trigger="hover"
            >
                Hover trigger
            </GeoadminTooltip>
            <GeoadminTooltip
                tooltip-content="Click trigger"
                open-trigger="click"
            >
                Click trigger
            </GeoadminTooltip>
            <GeoadminTooltip
                ref="manualTooltip"
                tooltip-content="Click again on the section's title to hide it"
                open-trigger="manual"
            >
                Manual trigger (click on section title to open)
            </GeoadminTooltip>
        </div>
    </div>
</template>
