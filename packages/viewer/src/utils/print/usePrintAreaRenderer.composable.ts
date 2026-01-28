import type { FlatExtent, SingleCoordinate } from '@swissgeo/coordinates'
import type { EventsKey } from 'ol/events'
import type Map from 'ol/Map'
import type RenderEvent from 'ol/render/Event'
import type { Size } from 'ol/size'
import type { MaybeRef, WatchHandle } from 'vue'

import log, { LogPreDefinedColor } from '@swissgeo/log'
import { DEVICE_PIXEL_RATIO } from 'ol/has'
import VectorLayer from 'ol/layer/Vector'
import { getRenderPixel } from 'ol/render'
import VectorSource from 'ol/source/Vector'
import { computed, toValue, watch } from 'vue'

import type { PrintLayoutSize } from '@/store/modules/print/types'
import type { ActionDispatcher } from '@/store/types'

import usePrintStore from '@/store/modules/print'
import useUIStore from '@/store/modules/ui'
import { PrintError } from '@/utils/print/print.api'

const dispatcher: ActionDispatcher = { name: 'print-area-renderer.composable' }

export default function usePrintAreaRenderer(map: MaybeRef<Map>): void {
    let printPreviewLayer: VectorLayer | undefined
    let deregister: (EventsKey | WatchHandle)[] = []
    const POINTS_PER_INCH = 72 // PostScript points 1/72"
    const MM_PER_INCHES = 25.4
    const UNITS_RATIO = 39.37 // inches per meter

    const printStore = usePrintStore()
    const uiStore = useUIStore()

    const isActive = computed(() => printStore.printSectionShown)
    const printLayoutSize = computed(() => printStore.printLayoutSize)
    const selectedScale = computed(() => printStore.selectedScale)
    // For simplicity, we use the screen size for the map size
    const mapWidth = computed(() => uiStore.width)
    // Same here for simplicity we take the screen size minus the header size for the map size (map
    // is under the header). We take the header size twice as the overlay is then centered on the
    // whole map (not only the part below the header)
    const mapHeight = computed(() => uiStore.height - uiStore.headerHeight * 2)

    watch(isActive, (newValue) => {
        if (newValue) {
            activatePrintArea()
        } else {
            deactivatePrintArea()
        }
    })

    function activatePrintArea() {
        // We need to add the prerender and postrender events to a layer that is not removed from the map before deactivation of the print renderer.
        // Else the print area will not be rendered when the layer is removed.
        printPreviewLayer = new VectorLayer({
            source: new VectorSource({
                useSpatialIndex: false,
                wrapX: true,
            }),
            zIndex: 10000,
        })
        toValue(map).addLayer(printPreviewLayer)

        deregister = [
            printPreviewLayer.on('prerender', handlePreRender),
            printPreviewLayer.on('postrender', handlePostRender),
            watch(printLayoutSize, () => {
                printStore.setSelectedScale(getOptimalScale(), dispatcher)
                updatePrintOverlay()
            }),
            watch(selectedScale, () => {
                updatePrintOverlay()
            }),
            toValue(map).on('change:size', () => {
                updatePrintOverlay()
            }),
            toValue(map)
                .getView()
                .on('propertychange', () => {
                    updatePrintOverlay()
                }),
        ]
        printStore.setSelectedScale(getOptimalScale(), dispatcher)
        updatePrintOverlay()
    }

    function deactivatePrintArea() {
        while (deregister.length > 0) {
            const item: WatchHandle | EventsKey | undefined = deregister.pop()
            if (!item) {
                return
            }
            if (typeof item === 'function') {
                item()
            } else if ('stop' in item && typeof item.stop === 'function') {
                // we are dealing with a Vue's WatchHandle
                item.stop()
            } else if (
                'target' in item &&
                'un' in item.target &&
                typeof item.target.un === 'function'
            ) {
                // we are dealing with an OpenLayers' EventKey
                item.target.un(item.type, item.listener)
            }
        }
        if (printPreviewLayer) {
            toValue(map).removeLayer(printPreviewLayer)
        }
        toValue(map).render()
    }

    function updatePrintOverlay() {
        if (isActive.value) {
            toValue(map).render()
        }
    }

    function calculatePageBoundsPixels(scale: number, size: PrintLayoutSize): FlatExtent {
        log.debug({
            title: 'usePrintAreaRenderer / calculatePageBoundsPixels',
            titleStyle: {
                backgroundColor: LogPreDefinedColor.Stone,
            },
            messages: [`Calculate page bounds pixels for scale ${scale} for size,`, size],
        })

        const view = toValue(map).getView()
        const resolution = view.getResolution()
        const mapSize = toValue(map).getSize()
        if (!resolution || !mapSize) {
            const message = 'No map size or resolution, cannot compute page bounds in pixels'
            log.error({
                title: 'usePrintAreaRenderer / calculatePageBoundsPixels',
                titleStyle: {
                    backgroundColor: LogPreDefinedColor.Stone,
                },
                messages: [message],
            })
            throw new PrintError(message)
        }

        const w = ((((size.width / POINTS_PER_INCH) * MM_PER_INCHES) / 1000.0) * scale) / resolution
        const h =
            ((((size.height / POINTS_PER_INCH) * MM_PER_INCHES) / 1000.0) * scale) / resolution
        const center = [mapSize[0]! / 2, mapSize[1]! / 2]

        const minx = center[0]! - w / 2
        const miny = center[1]! - h / 2
        const maxx = center[0]! + w / 2
        const maxy = center[1]! + h / 2

        log.debug({
            title: 'usePrintAreaRenderer / calculatePageBoundsPixels',
            titleStyle: {
                backgroundColor: LogPreDefinedColor.Stone,
            },
            messages: [
                `Calculated page bounds pixels for scale ${scale}: [${minx}, ${miny}, ${maxx}, ${maxy}]`,
                `resolution=${resolution} ratio=${DEVICE_PIXEL_RATIO} w=${w} h=${h}`,
                'mapSize',
                mapSize,
                'center',
                center,
            ],
        })
        return [minx, miny, maxx, maxy]
    }

    // Compose events
    function handlePreRender(event: RenderEvent) {
        const context = event.context
        if (context?.canvas) {
            ;(context as CanvasRenderingContext2D).save()
        }
    }
    function handlePostRender(event: RenderEvent) {
        // This is where we draw the print area rectangle using the worldPolygon

        if (!event.context?.canvas || !selectedScale.value) {
            return
        }
        const context = event.context as CanvasRenderingContext2D
        const size: Size | undefined = toValue(map).getSize()

        if (!Array.isArray(size) || size.length < 2) {
            return
        }

        const height = size[1]!
        const width = size[0]!

        const printRectangle = calculatePageBoundsPixels(selectedScale.value, printLayoutSize.value)

        const topLeftCoordinate = toValue(map).getCoordinateFromPixel([
            printRectangle[0],
            printRectangle[1],
        ])
        const rightBottomCoordinate = toValue(map).getCoordinateFromPixel([
            printRectangle[2],
            printRectangle[3],
        ])

        if (
            topLeftCoordinate &&
            rightBottomCoordinate &&
            topLeftCoordinate[0] !== undefined &&
            topLeftCoordinate[1] !== undefined &&
            rightBottomCoordinate[0] !== undefined &&
            rightBottomCoordinate[1] !== undefined
        ) {
            printStore.setPrintExtent(
                [
                    topLeftCoordinate[0], // minX
                    rightBottomCoordinate[1], // minY
                    rightBottomCoordinate[0], // maxX
                    topLeftCoordinate[1], // maxY
                ],
                dispatcher
            )
        }

        const getRenderPixelAsCoordinate = (x: number, y: number): SingleCoordinate => {
            return getRenderPixel(event, [x, y]) as SingleCoordinate
        }

        const viewportTopLeft: SingleCoordinate = getRenderPixelAsCoordinate(0, 0)
        const viewportTopRight: SingleCoordinate = getRenderPixelAsCoordinate(width, 0)
        const viewportBottomRight: SingleCoordinate = getRenderPixelAsCoordinate(width, height)
        const viewportBottomLeft: SingleCoordinate = getRenderPixelAsCoordinate(0, height)

        const [minX, minY, maxX, maxY] = printRectangle
        const printExtentBottomLeft: SingleCoordinate = getRenderPixelAsCoordinate(minX, minY)
        const printExtentTopLeft: SingleCoordinate = getRenderPixelAsCoordinate(minX, maxY)
        const printExtentTopRight: SingleCoordinate = getRenderPixelAsCoordinate(maxX, maxY)
        const printExtentBottomRight: SingleCoordinate = getRenderPixelAsCoordinate(maxX, minY)

        context.save()

        context.beginPath()

        // Outside polygon
        context.moveTo(viewportTopLeft[0], viewportTopLeft[1])
        context.lineTo(viewportTopRight[0], viewportTopRight[1])
        context.lineTo(viewportBottomRight[0], viewportBottomRight[1])
        context.lineTo(viewportBottomLeft[0], viewportBottomLeft[1])

        // Inner polygon
        context.moveTo(printExtentBottomLeft[0], printExtentBottomLeft[1])
        context.lineTo(printExtentTopLeft[0], printExtentTopLeft[1])
        context.lineTo(printExtentTopRight[0], printExtentTopRight[1])
        context.lineTo(printExtentBottomRight[0], printExtentBottomRight[1])

        context.closePath()

        context.fillStyle = 'rgba(0, 5, 25, 0.75)'
        context.fill()

        context.restore()
    }

    // Compute the optimal scale based on the map size (layout), resolution,
    // non-covered map vie (by header and menu tray)
    function getOptimalScale(): number | undefined {
        const resolution = toValue(map).getView().getResolution()
        if (!resolution || !printStore.selectedLayout?.scales) {
            return
        }
        const width = resolution * mapWidth.value
        const height = resolution * mapHeight.value
        const layoutSize = printLayoutSize.value
        const scaleWidth = (width * UNITS_RATIO * POINTS_PER_INCH) / layoutSize.width
        const scaleHeight = (height * UNITS_RATIO * POINTS_PER_INCH) / layoutSize.height
        let testScale = scaleWidth
        if (scaleHeight < testScale) {
            testScale = scaleHeight
        }
        const selectedLayoutScales = Array.from(printStore.selectedLayout.scales())
        // Make sure it's sorted descending
        selectedLayoutScales.sort((a, b) => b - a)
        log.debug({
            title: 'usePrintAreaRenderer / getOptimalScale',
            titleStyle: {
                backgroundColor: LogPreDefinedColor.Stone,
            },
            messages: [
                `Get print optimal scale, testScale=${testScale} size=[${mapWidth.value},${mapHeight.value}], resolution=${resolution}, layoutSize=`,
                layoutSize,
                `, scaleWidth=${scaleWidth} scaleHeight=${scaleHeight}`,
                selectedLayoutScales,
            ],
        })
        // Find the first scale that is smaller than the testScale in descending order
        return selectedLayoutScales.find((scale) => scale <= testScale) ?? selectedLayoutScales[0]
    }
}
