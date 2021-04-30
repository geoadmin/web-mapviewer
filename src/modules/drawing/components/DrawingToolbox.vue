<template>
    <portal to="modal-container">
        <div class="drawing-toolbox">
            <div class="card">
                <div class="card-body">
                    <button class="btn-close btn btn-default" @click="emitCloseEvent">
                        <font-awesome-icon :icon="['fas', 'times']" />
                    </button>
                    <DrawingToolboxButton
                        v-for="drawingMode in drawingModes"
                        :key="drawingMode"
                        :drawing-mode="drawingMode"
                        :is-active="currentDrawingMode === drawingMode"
                        :data-cy="`draw-mode-${drawingMode}`"
                        @setDrawingMode="bubbleSetDrawingEventToParent"
                    />
                </div>
            </div>
        </div>
    </portal>
</template>

<script>
import DrawingToolboxButton from '@/modules/drawing/components/DrawingToolboxButton'

export default {
    components: { DrawingToolboxButton },
    props: {
        drawingModes: {
            type: Array,
            required: true,
        },
        currentDrawingMode: {
            type: String,
            default: null,
        },
    },
    methods: {
        emitCloseEvent: function () {
            this.$emit('close')
        },
        bubbleSetDrawingEventToParent: function (drawingMode) {
            this.$emit('setDrawingMode', drawingMode)
        },
    },
}
</script>

<style lang="scss">
.drawing-toolbox {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;

    .btn-close {
        position: absolute;
        top: 0.25rem;
        right: 0.25rem;
    }
}
</style>
