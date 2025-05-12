<script setup>
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import GeoadminTooltip from '@geoadmin/tooltip'
import { useTemplateRef } from 'vue'

const { icon, popoverTitle, buttonClassOptions } = defineProps({
    /** The button should have either a title or icons (or both) */
    icon: {
        type: String,
        default: 'pen',
    },
    popoverTitle: {
        type: String,
        default: null,
    },
    buttonClassOptions: {
        type: String,
        default: null,
    },
})

const tooltipElement = useTemplateRef('tooltipElement')

/** Hides the popover container, can be called outside (by this component's parent) */
function hidePopover() {
    tooltipElement.value.closeTooltip()
}

defineExpose({ hidePopover })
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
                class="btn btn-sm btn-light h-100 d-flex align-items-center"
                :class="[buttonClassOptions ? buttonClassOptions : '']"
            >
                <FontAwesomeIcon :icon="icon" />
            </button>
            <template #content>
                <div
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
