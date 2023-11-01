<template>
    <div
        class="debug-tools card border-danger rounded-end-0"
        :class="{ collapsed: !showDebugTool }"
    >
        <div class="position-relative h-100 d-flex">
            <div
                class="debug-tools-header p-2 bg-danger-subtle border-end border-danger"
                @click="showDebugTool = !showDebugTool"
            >
                <FontAwesomeIcon icon="gear" />
                <div class="text-vertical text-nowrap">Debug tools</div>
            </div>
            <div class="debug-tools-body">
                <div class="card-body">
                    <h5 class="text-decoration-underline">Map projection</h5>
                    <div class="my-1 d-flex align-content-center">
                        <strong class="me-2 align-self-center">
                            {{ currentProjection.epsg }}
                        </strong>
                        <ToggleProjectionButton class="align-self-center" />
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import ToggleProjectionButton from '@/modules/menu/components/debug/ToggleProjectionButton.vue'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { computed, ref } from 'vue'
import { useStore } from 'vuex'

const store = useStore()

const showDebugTool = ref(false)
const currentProjection = computed(() => store.state.position.projection)
</script>

<style lang="scss" scoped>
.debug-tools {
    height: 9rem;

    $debugToolWidth: 12.5rem;
    $debugToolHeaderWidth: 2rem;
    width: $debugToolWidth;

    transition: all 0.4s;
    &.collapsed {
        transform: translateX($debugToolWidth - $debugToolHeaderWidth);
    }

    &-header {
        width: $debugToolHeaderWidth;
        height: 100%;
        cursor: pointer;
    }
    &-body {
        width: $debugToolWidth - $debugToolHeaderWidth;
        height: 100%;
    }

    .text-vertical {
        transform: translateY(300%) rotate(-90deg);
    }
}
</style>
