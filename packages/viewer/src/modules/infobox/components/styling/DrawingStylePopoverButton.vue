<script setup lang="ts">
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import GeoadminTooltip from '@swissgeo/tooltip'
import { useTemplateRef, computed } from 'vue'

type Props = {
    /** The button should have either a title or icons (or both) */
    icon?: string
    popoverTitle?: string | null
    buttonClassOptions?: string | null
}

const { icon, popoverTitle, buttonClassOptions } = defineProps<Props>()
const iconValue = computed<string>(() => icon ?? 'pen')

type TooltipRef = { closeTooltip: () => void } | null
const tooltipElement = useTemplateRef<TooltipRef>('tooltipElement')

/** Hides the popover container, can be called outside (by this component's parent) */
function hidePopover(): void {
    tooltipElement.value?.closeTooltip?.()
}

defineExpose<{ hidePopover: () => void }>({ hidePopover })
</script>

<template>
    <div>
        <GeoadminTooltip
            ref="tooltipElement"
            open-trigger="click"
            placement="left"
        >
            <button
                ref="popoverButton"
                class="btn btn-sm btn-light d-flex align-items-center h-100"
                :class="[buttonClassOptions ? buttonClassOptions : '']"
            >
                <FontAwesomeIcon :icon="iconValue" />
            </button>
            <template #content>
                <div
                    :icon="iconValue"
                    ref="popoverContent"
                    class="card border-0"
                    data-cy="drawing-style-popover"
                >
                    <div
                        class="card-header d-flex align-items-center"
                        :class="{
                            'justify-content-between': popoverTitle,
                            'justify-content-end': !popoverTitle,
                        }"
                    >
                        <span v-if="popoverTitle">
                            {{ popoverTitle }}
                        </span>
                        <button
                            class="btn btn-sm btn-light d-flex align-items-center"
                            data-cy="close-popover-button"
                            @click="hidePopover"
                        >
                            <FontAwesomeIcon icon="times" />
                        </button>
                    </div>
                    <div class="popover-content card-body rounded-bottom">
                        <slot />
                    </div>
                </div>
            </template>
        </GeoadminTooltip>
    </div>
</template>
