<template>
    <div
        class="debug-tools card border-danger rounded-end-0 me-n1"
        :class="{ collapsed: !showDebugTool }"
    >
        <div class="position-relative d-flex">
            <div
                class="debug-tools-header p-2 bg-danger-subtle border-end border-danger rounded-start-1"
                @click="showDebugTool = !showDebugTool"
            >
                <FontAwesomeIcon icon="gear" title="Debug tools" />
            </div>
            <div v-if="showDebugTool" class="debug-tools-body">
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
    $debugToolWidth: 12.5rem;
    $debugToolHeaderWidth: 2rem;
    width: $debugToolWidth;

    transition: all 0.4s;
    &.collapsed {
        transform: translateX($debugToolWidth - $debugToolHeaderWidth);
    }

    &-header {
        cursor: pointer;
    }
}
</style>
