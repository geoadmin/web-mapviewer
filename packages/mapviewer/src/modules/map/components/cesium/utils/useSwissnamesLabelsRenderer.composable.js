import log from '@geoadmin/log'
import {
    Cartesian2,
    Cartesian3,
    Cesium3DTileStyle,
    Cesium3DTileset,
    Color,
    DistanceDisplayCondition,
    HeightReference,
    HorizontalOrigin,
    LabelCollection,
    LabelStyle,
    VerticalOrigin,
} from 'cesium'
import { onBeforeUnmount, onMounted } from 'vue'

const PUBLICATION_PATH = 'v3/tileset.json'
const HEIGHT_OFFSET = 2
const BACKGROUND_COLOR = Color.fromCssColorString('#15191e').withAlpha(0.94)
const BACKGROUND_PADDING = new Cartesian2(5, 2)
const LAKE_COLOR = Color.fromCssColorString('#b8e1ff')
const PEAK_COLOR = Color.fromCssColorString('#ffc2a8')

function getColor(type) {
    switch (type) {
        case 'SEE':
            return LAKE_COLOR
        case 'GIPFEL':
            return PEAK_COLOR
        default:
            return Color.WHITE
    }
}

function addLabels(collection, feature) {
    const fontSize = feature.getProperty('fontSize')
    const position = Cartesian3.fromDegrees(
        feature.getProperty('longitude'),
        feature.getProperty('latitude'),
        HEIGHT_OFFSET
    )
    const shared = {
        position,
        heightReference: HeightReference.RELATIVE_TO_TERRAIN,
        fillColor: getColor(feature.getProperty('type')),
        horizontalOrigin: HorizontalOrigin.CENTER,
        disableDepthTestDistance: 0,
        distanceDisplayCondition: new DistanceDisplayCondition(
            0,
            feature.getProperty('maxDistance')
        ),
    }
    return [
        collection.add({
            ...shared,
            text: feature.getProperty('text'),
            font: `${fontSize}px Arial, sans-serif`,
            style: LabelStyle.FILL,
            showBackground: true,
            backgroundColor: BACKGROUND_COLOR,
            backgroundPadding: BACKGROUND_PADDING,
            verticalOrigin: VerticalOrigin.BOTTOM,
        }),
        collection.add({
            ...shared,
            text: '|',
            font: `${fontSize}px monospace`,
            style: LabelStyle.FILL_AND_OUTLINE,
            outlineColor: Color.WHITE,
            outlineWidth: 1,
            pixelOffset: new Cartesian2(0, 4),
            verticalOrigin: VerticalOrigin.TOP,
        }),
    ]
}

export default function useSwissnamesLabelsRenderer(getViewer, layerConfig) {
    let viewer = null
    let tileset = null
    let labels = null
    let isUnmounted = false
    const visibleTiles = new Set()
    const activeLabels = new Map()
    const disposers = []

    function synchronizeLabels() {
        for (const [tile, tileLabels] of activeLabels) {
            if (!visibleTiles.has(tile)) {
                tileLabels.forEach((label) => labels.remove(label))
                activeLabels.delete(tile)
            }
        }
        for (const tile of visibleTiles) {
            if (!activeLabels.has(tile)) {
                const tileLabels = []
                for (let index = 0; index < tile.content.featuresLength; index += 1) {
                    tileLabels.push(...addLabels(labels, tile.content.getFeature(index)))
                }
                activeLabels.set(tile, tileLabels)
            }
        }
        visibleTiles.clear()
    }

    onMounted(async () => {
        viewer = getViewer()
        if (!viewer) {
            log.error('Failed to load Swissnames labels: missing Cesium viewer')
            return
        }
        try {
            const tilesetUrl =
                import.meta.env.VITE_APP_SWISSNAMES_TILESET_URL ??
                `${layerConfig.baseUrl}${layerConfig.id}/${PUBLICATION_PATH}`
            const loadedTileset = await Cesium3DTileset.fromUrl(tilesetUrl)
            if (isUnmounted) {
                loadedTileset.destroy()
                return
            }
            loadedTileset.style = new Cesium3DTileStyle({ show: false })
            tileset = viewer.scene.primitives.add(loadedTileset)
            labels = viewer.scene.primitives.add(new LabelCollection({ scene: viewer.scene }))
            disposers.push(
                tileset.tileVisible.addEventListener((tile) => visibleTiles.add(tile)),
                viewer.scene.postRender.addEventListener(synchronizeLabels)
            )
        } catch (error) {
            log.error('Failed to load Swissnames labels', error)
        }
    })

    onBeforeUnmount(() => {
        isUnmounted = true
        disposers.forEach((dispose) => dispose())
        if (labels) {
            viewer.scene.primitives.remove(labels)
        }
        if (tileset) {
            viewer.scene.primitives.remove(tileset)
        }
        viewer?.scene.requestRender()
    })
}
