<template>
    <portal to="modal-container">
        <div class="drawing-toolbox">
            <div class="card">
                <div class="card-body">
                    <button class="btn-close btn btn-default" @click="emitCloseEvent">
                        <font-awesome-icon :icon="['fas', 'times']" />
                    </button>
                    <div class="buttons-container">
                        <DrawingToolboxButton
                            v-for="drawingMode in drawingModes"
                            :key="drawingMode"
                            :drawing-mode="drawingMode"
                            :is-active="currentDrawingMode === drawingMode"
                            @setDrawingMode="bubbleSetDrawingEventToParent"
                        />
                        <br />
                        <div class="btn-group btn-group-sm draw-action-btns" role="group">
                            <button type="button" class="btn btn-outline-secondary" disabled>
                                {{ $t('draw_delete') }}
                            </button>
                            <button
                                type="button"
                                class="btn btn-outline-secondary"
                                @click="emitExportEvent"
                            >
                                {{ $t('export_kml') }}
                            </button>
                            <button type="button" class="btn btn-outline-secondary" disabled>
                                {{ $t('share') }}
                            </button>
                        </div>
                    </div>
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
        emitExportEvent: function () {
            this.$emit('export')
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

.buttons-container .draw-action-btns {
    width: 222px;
    margin-top: 10px;
}
</style>
