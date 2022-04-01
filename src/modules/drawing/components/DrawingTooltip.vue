<template>
    <div ref="drawingTooltip" class="drawing-tooltip"></div>
</template>

<script>
import { Polygon } from 'ol/geom'
import Overlay from 'ol/Overlay'

export default {
    inject: ['getMap'],
    props: {
        currentDrawingMode: {
            type: String,
            default: null,
        },
        selectedFeatures: {
            type: Array,
            default: () => [],
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
            if (map) {
                let hoveringSelectableFeature = false
                let hoveringSelectedFeature = false

                const hasFeatureSelected = this.selectedFeatures && this.selectedFeatures.length > 0
                // we only keep track of the first feature's info (the one on top of the stack)
                const selectedFeatureId = hasFeatureSelected && this.selectedFeatures[0].id
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
                if (featureUnderCursor?.getGeometry() instanceof Polygon) {
                    hoveringSelectedFeature = false
                }

                const featureType = featureUnderCursor?.get('drawingMode')?.toLowerCase()
                if (hoveringSelectedFeature) {
                    // Display a help tooltip when modifying
                    if (['marker', 'annotation'].includes(featureType)) {
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
                    if (this.currentDrawingMode) {
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
