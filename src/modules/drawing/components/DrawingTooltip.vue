<template>
    <div ref="drawingTooltip" class="drawing-tooltip"></div>
</template>

<script>
import { Polygon } from 'ol/geom'
import Overlay from 'ol/Overlay'

export default {
    inject: ['getMap', 'getDrawingLayer', 'getSelectInteraction', 'getModifyInteraction'],
    props: {
        currentDrawingMode: {
            type: String,
            default: null,
        },
        currentlyEditedFeature: {
            type: Object,
            default: null,
        },
    },
    data() {
        return {
            sketchPoints: 0,
        }
    },
    created() {
        this.tooltipOverlay = new Overlay({
            offset: [15, 15],
            positioning: 'top-left',
            // so that the tooltip is not on top of the style popup (and its children popup)
            stopEvent: false,
            insertFirst: true,
        })
    },
    mounted() {
        this.tooltipOverlay.setElement(this.$refs.drawingTooltip)
        const map = this.getMap()
        if (map) {
            map.addOverlay(this.tooltipOverlay)
            map.on('pointermove', this.onPointerMove)
        }
    },
    beforeUnmount() {
        const map = this.getMap()
        if (map) {
            map.removeOverlay(this.tooltipOverlay)
            map.un('pointermove', this.onPointerMove)
        }
    },
    methods: {
        updateTooltipText(translationKeyLine1, translationKeyLine2 = null) {
            if (translationKeyLine2) {
                this.tooltipOverlay.getElement().innerHTML =
                    this.$i18n.t(translationKeyLine1) + '<br/>' + this.$i18n.t(translationKeyLine2)
            } else {
                this.tooltipOverlay.getElement().innerHTML = this.$i18n.t(translationKeyLine1)
            }
        },
        onPointerMove(event) {
            // moving the tooltip with the mouse cursor
            this.tooltipOverlay.setPosition(event.coordinate)
            // detecting features under the mouse cursor
            const map = this.getMap()
            const modifyInteraction = this.getModifyInteraction()
            const selectInteraction = this.getSelectInteraction()
            if (map && modifyInteraction && selectInteraction) {
                const hoveringVertex = modifyInteraction.snappedToVertex_
                let hoveringSelectableFeature = false
                let hoveringSelectedFeature = false

                const hasFeatureSelected = selectInteraction.getFeatures().getLength() > 0
                // we only keep track of the first feature's info (the one on top of the stack)
                const selectedFeatureId = selectInteraction.getFeatures().item(0)?.getId()
                let featureUnderCursor

                map.forEachFeatureAtPixel(event.pixel, (feature, layer) => {
                    // we ignore feature not linked to any layer
                    if (!layer) {
                        return
                    }

                    // keeping track that features are being overed (even if not selected)
                    hoveringSelectableFeature = true

                    const isSelectedFeature =
                        hasFeatureSelected && selectedFeatureId === feature.getId()
                    hoveringSelectedFeature = hoveringSelectedFeature || isSelectedFeature
                    // subsequent features will be ignored as featureUnderCursor will already be set
                    if (!featureUnderCursor || isSelectedFeature) {
                        featureUnderCursor = feature
                    }
                })
                // detecting if we are hovering the area of a polygon (and not its borders)
                // if so, we suppress the flag "hoveringSelectedFeature" as it is of no value
                // to know that we are hovering the area (only borders have interactivity)
                if (
                    featureUnderCursor?.getGeometry() instanceof Polygon &&
                    modifyInteraction.vertexFeature_ === null
                ) {
                    hoveringSelectedFeature = false
                }

                const featureType = featureUnderCursor?.get('drawingMode')?.toLowerCase()
                if (hoveringSelectedFeature) {
                    // Display a help tooltip when modifying
                    if (hoveringVertex || ['marker', 'annotation'].includes(featureType)) {
                        this.updateTooltipText(`modify_existing_vertex_${featureType}`)
                    } else {
                        this.updateTooltipText(`modify_new_vertex_${featureType}`)
                    }
                } else if (hoveringSelectableFeature) {
                    // Display a help tooltip when selecting
                    if (featureType) {
                        this.updateTooltipText(`select_feature_${featureType}`)
                    } else {
                        this.updateTooltipText('select_no_feature')
                    }
                } else {
                    // Display a help tooltip when drawing
                    // TODO: help for each drawing mode
                    if (this.currentlyEditedFeature) {
                        const geom = this.currentlyEditedFeature.getGeometry()
                        if (geom instanceof Polygon) {
                            // The sketched polygon is always closed, so we remove the last coordinate.
                            const lineCoords = geom.getCoordinates()[0].slice(0, -1)
                            if (this.sketchPoints !== lineCoords.length) {
                                // A point is added or removed
                                this.sketchPoints = lineCoords.length
                            } else if (lineCoords.length > 1) {
                                const firstPoint = lineCoords[0]
                                const lastPoint = lineCoords[lineCoords.length - 1]
                                const sketchPoint = lineCoords[lineCoords.length - 2]

                                // Checks is snapped to first point of geom
                                const isSnapOnFirstPoint =
                                    lastPoint[0] === firstPoint[0] && lastPoint[1] === firstPoint[1]

                                // Checks is snapped to last point of geom
                                const isSnapOnLastPoint =
                                    lastPoint[0] === sketchPoint[0] &&
                                    lastPoint[1] === sketchPoint[1]

                                this.isFinishOnFirstPoint_ =
                                    !isSnapOnLastPoint && isSnapOnFirstPoint

                                // this.updateHelpTooltip(
                                //     type,
                                //     true,
                                //     this.tools[type].minPoints_ < lineCoords.length,
                                //     this.isFinishOnFirstPoint_,
                                //     isSnapOnLastPoint
                                // )
                            }
                        }
                    } else if (this.currentDrawingMode) {
                        this.updateTooltipText(
                            `draw_start_${this.currentDrawingMode.toLowerCase()}`
                        )
                        // let helpMsgId = 'draw_start_'
                        // if (drawStarted) {
                        //     if (type !== 'marker' && type !== 'annotation') {
                        //         helpMsgId = 'draw_next_'
                        //     }
                        //     if (onLastPoint) {
                        //         helpMsgId = 'draw_snap_last_point_'
                        //     }
                        //     if (onFirstPoint) {
                        //         helpMsgId = 'draw_snap_first_point_'
                        //     }
                        // }
                        // if (drawStarted && hasMinNbPoints) {
                        //     this.updateTooltipText(helpMsgId + type, 'draw_delete_last_point')
                        // } else {
                        //     this.updateTooltipText(helpMsgId + type)
                        // }
                    } else {
                        this.updateTooltipText('select_no_feature')
                    }
                }
            }
        },
    },
}
</script>

<style lang="scss" scoped>
.drawing-tooltip {
    background-color: rgba(140, 140, 140, 0.9);
    border-radius: 4px;
    color: white;
    padding: 2px 8px;
    font-size: 12px;
    pointer-events: none;
}
</style>
