<script setup>
import GeoadminTooltip from '@geoadmin/tooltip'
import { useI18n } from 'vue-i18n'

const props = defineProps({
    /**
     * Id of the select item
     *
     * @type {String | Number}
     */
    id: { type: [String, Number], required: true },
    /**
     * Title of the select item
     *
     * @type {String}
     */
    title: { type: String, required: true },
    /**
     * Value of the select item
     *
     * @type {String | Number | Object}
     */
    value: { type: [String, Number, Object], default: null },
    /**
     * Description of the select item
     *
     * @type {String}
     */
    description: { type: String, default: '' },
    /**
     * Current value of the select item
     *
     * @type {String | Number | Object}
     */
    currentValue: {
        type: [String, Number, Object],
        required: true,
    },
})
const { t } = useI18n()

const emits = defineEmits({ selectItem: (item) => item?.id && item?.title })
function handleClick() {
    emits('selectItem', { ...props, value: props.value ?? props.title })
}

function getItemDescription(description) {
    if (!description) {
        return null
    }

    return t(description)
}
</script>

<template>
    <li>
        <GeoadminTooltip
            :tooltip-content="getItemDescription(description)"
            placement="left"
            :disabled="!description"
        >
            <a
                class="dropdown-item"
                :class="{ active: currentValue === (value ?? title) }"
                :data-cy="`dropdown-item-${id}`"
                @click="handleClick"
            >
                {{ t(title) }}
            </a>
        </GeoadminTooltip>
    </li>
</template>

<style lang="scss" scoped>
.dropdown-item {
    cursor: pointer;
}
</style>
