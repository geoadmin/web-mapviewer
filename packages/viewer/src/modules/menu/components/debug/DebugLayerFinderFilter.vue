<script setup lang="ts">
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { ref, watch } from 'vue'

const emits = defineEmits(['change'])

const currentValue = ref<boolean | null>(null)

watch(currentValue, (value) => {
    emits('change', value)
})
</script>

<template>
    <div class="btn-group btn-group-sm">
        <button
            type="button"
            class="btn"
            :class="{
                'btn-danger active text-white': currentValue === false,
                'btn-outline-danger': currentValue !== false,
            }"
            @click="currentValue = false"
        >
            <FontAwesomeIcon icon="times" />
        </button>
        <button
            type="button"
            class="btn btn-outline-warning"
            :class="{
                active: currentValue === null,
            }"
            @click="currentValue = null"
        >
            <FontAwesomeIcon icon="question" />
        </button>
        <button
            type="button"
            class="btn"
            :class="{
                'btn-success active': currentValue === true,
                'btn-outline-success': currentValue !== true,
            }"
            @click="currentValue = true"
        >
            <FontAwesomeIcon icon="check" />
        </button>
    </div>
</template>
