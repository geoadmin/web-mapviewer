<script lang="ts" setup generic="T">
/**
 * Component to render a dropdown button.
 *
 * It is possible to have the dropdown attached to an extra button with a caret, instead of all
 * inline. For that you have to add the with-toggle-button props to the component use.
 */
import { size, useFloating } from '@floating-ui/vue'
import GeoadminTooltip from '@swissgeo/tooltip'
import { onClickOutside } from '@vueuse/core'
import { v4 as uuidv4 } from 'uuid'
import { computed, ref, useTemplateRef, watch } from 'vue'
import { useI18n } from 'vue-i18n'

export interface DropdownItem<T> {
    id: string | number
    title: string
    value: T
    description?: string
}

interface DropdownButtonProps<T> {
    title: string
    items: DropdownItem<T>[]
    currentValue: undefined | string | number | object
    withToggleButton?: boolean
    disabled?: boolean
    small?: boolean
}

const {
    title,
    items,
    currentValue,
    withToggleButton = false,
    disabled = false,
    small = false,
} = defineProps<DropdownButtonProps<T>>()

const emits = defineEmits<{
    click: []
    selectItem: [item: DropdownItem<T>]
}>()

const isOpen = ref<boolean>(false)

const { t } = useI18n()

const dropdownMenuRef = useTemplateRef<HTMLUListElement>('dropdownMenu')
const dropdownToggleButtonRef = useTemplateRef<HTMLButtonElement>('dropdownToggleButton')
const dropdownMainButtonRef = useTemplateRef<HTMLButtonElement>('dropdownMainButton')

const anchorElement = computed<HTMLElement | undefined>(() => {
    if (withToggleButton) {
        return dropdownToggleButtonRef.value ?? undefined
    }
    return dropdownMainButtonRef.value ?? undefined
})

// generating a unique HTML ID for this dropdown
const uniqueHtmlId = ref<string>(`dropdown-${uuidv4()}`)

const { floatingStyles } = useFloating(anchorElement, dropdownMenuRef, {
    placement: 'bottom-end',
    strategy: 'fixed',
    middleware: [
        size({
            apply(middlewareState) {
                const documentHeight = document.documentElement.clientHeight
                const startingHeightFloatingElement =
                    middlewareState.rects.reference.y + middlewareState.rects.reference.height
                const remainingHeight = documentHeight - startingHeightFloatingElement

                if (dropdownMenuRef.value) {
                    Object.assign(dropdownMenuRef.value.style, {
                        maxWidth: `${Math.max(middlewareState.availableWidth, middlewareState.rects.reference.width)}px`,
                        maxHeight: `${Math.max(0, remainingHeight)}px`,
                        overflowY: 'auto',
                    })
                }
            },
        }),
    ],
})

onClickOutside(dropdownMenuRef, () => {
    isOpen.value = false
})

watch(
    () => disabled,
    (isDisabled) => {
        if (isDisabled && dropdownMenuRef.value?.classList) {
            // hiding the dropdown body if the component becomes disabled
            dropdownMenuRef.value.classList.remove('show')
        }
    }
)

function onMainButtonClick(): void {
    if (!withToggleButton) {
        isOpen.value = !isOpen.value
    }
    emits('click')
}

function onToggleButtonClick(): void {
    isOpen.value = !isOpen.value
}

function onItemClick(event: MouseEvent, item: DropdownItem<T>): void {
    // Stopping the propagation (bubbling up) of the event here.
    // This is to keep any floating parent from receiving the click too, and closing because of that.
    // (Was happening in the context of feature edit, where icon style edit is in a floatingUI element with dropdowns)
    event.stopPropagation()
    emits('selectItem', item)
    isOpen.value = false
}

function getItemDescription(description?: string): string | undefined {
    if (!description) {
        return
    }
    return t(description)
}
</script>

<template>
    <div :class="{ 'btn-group': withToggleButton }">
        <button
            :id="withToggleButton ? '' : uniqueHtmlId"
            ref="dropdownMainButton"
            :disabled="disabled"
            class="btn btn-light"
            :class="{ 'dropdown-toggle': !withToggleButton, 'btn-sm': small }"
            type="button"
            data-cy="dropdown-main-button"
            @click="onMainButtonClick"
        >
            {{ t(title) }}
        </button>
        <button
            v-if="withToggleButton"
            :id="uniqueHtmlId"
            ref="dropdownToggleButton"
            :disabled="disabled"
            type="button"
            class="btn btn-light dropdown-toggle dropdown-toggle-split geoadmin-dropdown-button-caret"
            data-cy="dropdown-toggle-button"
            @click="onToggleButtonClick"
        >
            <span class="visually-hidden">Toggle Dropdown</span>
        </button>
        <div
            v-if="isOpen"
            ref="dropdownMenu"
            class="geoadmin-dropdown-container border-light-subtle rounded border bg-white p-1 shadow-sm"
            :style="floatingStyles"
            data-cy="dropdown-container"
        >
            <GeoadminTooltip
                v-for="item in items"
                :key="item.id"
                :tooltip-content="getItemDescription(item.description)"
                placement="left"
                :disabled="!item.description"
            >
                <div
                    class="geoadmin-dropdown-button-item m-0 cursor-pointer rounded px-3 py-2"
                    :class="{
                        active: currentValue === (item.value ?? title),
                    }"
                    :data-cy="`dropdown-item-${item.id}`"
                    @click="(e) => onItemClick(e, item)"
                >
                    {{ t(item.title) }}
                </div>
            </GeoadminTooltip>
        </div>
    </div>
</template>

<style lang="scss" scoped>
@import '@swissgeo/theme/scss/colors';

.geoadmin-dropdown-button-caret {
    max-width: fit-content;
}
.geoadmin-dropdown-container {
    z-index: 1000;
}
.geoadmin-dropdown-button-item {
    font-size: 1rem;
    &:hover {
        background-color: $smoke;
    }
    &.active {
        background-color: $malibu;
        color: $white;
    }
}
</style>
