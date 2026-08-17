import log from '@geoadmin/log'
import {
    Cartesian2,
    Cartesian3,
    Cesium3DTileStyle,
    Cesium3DTileset,
    Color,
    DistanceDisplayCondition,
    HorizontalOrigin,
    LabelCollection,
    LabelStyle,
    NearFarScalar,
    PolylineCollection,
    VerticalOrigin,
} from 'cesium'
import { onBeforeUnmount, onMounted } from 'vue'

const FADE_START_RATIO = 0.76
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

function getPosition(feature, heightProperty) {
    return Cartesian3.fromDegrees(
        feature.getProperty('longitude'),
        feature.getProperty('latitude'),
        feature.getProperty(heightProperty)
    )
}

function addConnector(collection, positions, distanceDisplayCondition) {
    return collection.add({
        positions,
        width: 1,
        distanceDisplayCondition,
    })
}

function addLabel(collection, feature, position, distanceDisplayCondition) {
    const maxDistance = feature.getProperty('maxDistance')
    return collection.add({
        position,
        text: feature.getProperty('text'),
        font: `${feature.getProperty('fontSize')}px Arial, sans-serif`,
        style: LabelStyle.FILL,
        fillColor: getColor(feature.getProperty('type')),
        showBackground: true,
        backgroundColor: BACKGROUND_COLOR,
        backgroundPadding: BACKGROUND_PADDING,
        horizontalOrigin: HorizontalOrigin.CENTER,
        verticalOrigin: VerticalOrigin.BOTTOM,
        disableDepthTestDistance: 0,
        distanceDisplayCondition,
        translucencyByDistance: new NearFarScalar(
            maxDistance * FADE_START_RATIO,
            1,
            maxDistance,
            0
        ),
    })
}

function addFeature(labelCollection, connectorCollection, feature) {
    const groundPosition = getPosition(feature, 'groundHeight')
    const labelPosition = getPosition(feature, 'labelHeight')
    const distance = new DistanceDisplayCondition(0, feature.getProperty('maxDistance'))
    return {
        connector: addConnector(connectorCollection, [groundPosition, labelPosition], distance),
        label: addLabel(labelCollection, feature, labelPosition, distance),
    }
}

export default function useSwissnamesLabelsRenderer(getViewer, layerConfig) {
    let viewer = null
    let tileset = null
    let labels = null
    let connectors = null
    let isUnmounted = false
    // tileVisible is a per-frame signal. Keep created labels until Cesium evicts their tile.
    const visibleTiles = new Set()
    // Tileset events queue work because Cesium forbids collection changes during traversal.
    const unloadedTiles = new Set()
    // Track each rendered label and connector by its owning tile for deterministic cleanup.
    const activeFeatures = new Map()
    const disposers = []

    function synchronizeLabels() {
        // Remove the rendered objects of tiles that Cesium evicted from its cache.
        for (const tile of unloadedTiles) {
            const tileFeatures = activeFeatures.get(tile) ?? []
            for (const { connector, label } of tileFeatures) {
                connectors.remove(connector)
                labels.remove(label)
            }
            activeFeatures.delete(tile)
            visibleTiles.delete(tile)
        }
        unloadedTiles.clear()
        // Repeated tileVisible events are idempotent because each active tile is added once.
        for (const tile of visibleTiles) {
            if (activeFeatures.has(tile)) {
                continue
            }
            const tileFeatures = []
            for (let index = 0; index < tile.content.featuresLength; index += 1) {
                tileFeatures.push(addFeature(labels, connectors, tile.content.getFeature(index)))
            }
            activeFeatures.set(tile, tileFeatures)
        }
        visibleTiles.clear()
    }

    async function initializeRenderer() {
        viewer = getViewer()
        if (!viewer) {
            log.error('Failed to load Swissnames labels: missing Cesium viewer')
            return
        }
        try {
            const tilesetUrl = `${layerConfig.baseUrl}${layerConfig.id}/${layerConfig.urlTimestampToUse}/tileset.json`
            const loadedTileset = await Cesium3DTileset.fromUrl(tilesetUrl)
            // Loading can finish after unmount. Destroy a tileset that was never attached to the scene.
            if (isUnmounted) {
                loadedTileset.destroy()
                return
            }
            // The tileset provides tile selection and feature metadata. It does not render its source points.
            loadedTileset.style = new Cesium3DTileStyle({ show: false })
            tileset = viewer.scene.primitives.add(loadedTileset)
            // Dedicated collections render the visible labels and their terrain connectors.
            connectors = viewer.scene.primitives.add(new PolylineCollection())
            labels = viewer.scene.primitives.add(new LabelCollection({ scene: viewer.scene }))
            disposers.push(
                tileset.tileVisible.addEventListener((tile) => visibleTiles.add(tile)),
                tileset.tileUnload.addEventListener((tile) => unloadedTiles.add(tile)),
                // Tileset events run during traversal, so change primitive collections after rendering.
                viewer.scene.postRender.addEventListener(synchronizeLabels)
            )
        } catch (error) {
            log.error('Failed to load Swissnames labels', error)
        }
    }

    onMounted(initializeRenderer)

    onBeforeUnmount(() => {
        isUnmounted = true
        disposers.forEach((dispose) => dispose())
        if (labels) {
            viewer.scene.primitives.remove(labels)
        }
        if (connectors) {
            viewer.scene.primitives.remove(connectors)
        }
        if (tileset) {
            viewer.scene.primitives.remove(tileset)
        }
        viewer?.scene.requestRender()
    })
}
