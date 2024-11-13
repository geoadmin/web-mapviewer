<script setup>
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { onMounted, ref } from 'vue'

const props = defineProps({
    tooltipText: {
        type: String,
        default: 'Add new vertex', // TODO: use the same tooltip system
    },
})

const emit = defineEmits(['button-mounted'])

const buttonRef = ref(null)

function addVertex() {
    console.log('addVertex')
}

onMounted(() => {
    // Emit an event to notify the parent component that the button is mounted
    emit('button-mounted', buttonRef.value)
})
</script>

<template>
    <div ref="buttonRef" class="add-button">
        <button class="btn" @click="addVertex">
            <span class="icon-circle">
                <FontAwesomeIcon icon="fas fa-plus" />
            </span>
            <span class="tooltip">{{ props.tooltipText }}</span>
        </button>
    </div>
</template>

<style scoped>
.add-button {
    position: absolute;
    z-index: 99;
}

.icon-circle {
    display: inline-block;
    width: 1.5rem;
    height: 1.5rem;
    background-color: white;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 1px solid black;
}

.tooltip {
    visibility: hidden;
    background-color: black;
    color: #fff;
    text-align: center;
    border-radius: 6px;
    padding: 5px;
    position: absolute;
    z-index: 1;
    bottom: 125%;
    left: 50%;
    margin-left: -60px;
    width: 120px;
    opacity: 0;
    transition: opacity 0.3s;
}

.btn:hover .tooltip {
    visibility: visible;
    opacity: 1;
}
</style>
