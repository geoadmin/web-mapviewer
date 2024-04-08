import OLStyleIcon from 'ol/style/Icon'
import OLClusterSource from 'ol/source/Cluster'
import { circular as olCreateCircularPolygon } from 'ol/geom/Polygon'
import { boundingExtent, getCenter } from 'ol/extent'
import olGeomSimpleGeometry from 'ol/geom/SimpleGeometry'
import {
    convertColorToCesium,
    ol4326CoordinateArrayToCsCartesians,
    ol4326CoordinateToCesiumCartesian,
    olGeometryCloneTo4326,
} from './core'
import type { OlFeatureToCesiumContext } from './VectorLayerCounterpart'
import VectorLayerCounterpart from './VectorLayerCounterpart'
import { getUid, waitReady } from './util'
import {
    Billboard,
    BillboardCollection,
    Cartesian2,
    Cartesian3,
    CircleGeometry,
    CircleOutlineGeometry,
    ClassificationType,
    Color as CesiumColor,
    ColorGeometryInstanceAttribute,
    DebugModelMatrixPrimitive,
    Ellipsoid,
    Geometry as CSGeometry,
    GeometryInstance,
    GroundPolylineGeometry,
    GroundPolylinePrimitive,
    GroundPrimitive,
    HeightReference,
    HorizontalOrigin,
    ImageMaterialProperty,
    Label,
    LabelCollection,
    LabelStyle,
    Material,
    MaterialAppearance,
    Matrix4,
    Model,
    PolygonGeometry,
    PolygonHierarchy,
    PolygonOutlineGeometry,
    PolylineGeometry,
    PolylineMaterialAppearance,
    Primitive,
    PrimitiveCollection,
    Rectangle,
    RectangleGeometry,
    RectangleOutlineGeometry,
    Scene,
    VerticalOrigin,
} from 'cesium'
import type VectorLayer from 'ol/layer/Vector'
import type ImageLayer from 'ol/layer/Image'
import type { Feature, View } from 'ol'
import type Text from 'ol/style/Text'
import type { ColorLike as OLColorLike, PatternDescriptor } from 'ol/colorlike'
import type { Color as OLColor } from 'ol/color'
import type { ProjectionLike } from 'ol/proj'
import {
    type Circle,
    Geometry as OLGeometry,
    type GeometryCollection,
    type LineString,
    type MultiLineString,
    type MultiPoint,
    type MultiPolygon,
    type Point,
    type Polygon,
} from 'ol/geom'
import type ImageStyle from 'ol/style/Image'
import type { default as Style, StyleFunction } from 'ol/style/Style'
import type { VectorSourceEvent } from 'ol/source/Vector'
import VectorSource from 'ol/source/Vector'
import type { Size } from 'ol/size'

type ModelFromGltfOptions = Parameters<typeof Model.fromGltfAsync>[0]

type PrimitiveLayer = VectorLayer<any> | ImageLayer<any>

declare module 'cesium' {
    // eslint-disable-next-line no-unused-vars
    interface Primitive {
        olLayer: PrimitiveLayer
        olFeature: Feature
    }
    // eslint-disable-next-line no-unused-vars
    interface GroundPolylinePrimitive {
        olLayer: PrimitiveLayer
        olFeature: Feature
        _primitive: Primitive // Missing from types published by Cesium
    }
    // eslint-disable-next-line no-unused-vars
    interface GroundPrimitive {
        olLayer: PrimitiveLayer
        olFeature: Feature
    }
    // eslint-disable-next-line no-unused-vars
    interface Label {
        olLayer: PrimitiveLayer
        olFeature: Feature
    }
    // eslint-disable-next-line no-unused-vars
    interface Billboard {
        olLayer: PrimitiveLayer
        olFeature: Feature
    }
}

interface ModelStyle {
    debugModelMatrix?: Matrix4
    cesiumOptions: ModelFromGltfOptions
}

interface MaterialAppearanceOptions {
    flat: boolean
    renderState: {
        depthTest: {
            enabled: boolean
        }
        lineWidth?: number
    }
}

export default class FeatureConverter {
    /** Bind once to have a unique function for using as a listener */
    private boundOnRemoveOrClearFeatureListener_ = this.onRemoveOrClearFeature_.bind(this)

    private defaultBillboardEyeOffset_ = new Cartesian3(0, 0, 10)

    /**
     * Concrete base class for converting from OpenLayers3 vectors to Cesium primitives. Extending
     * this class is possible provided that the extending class and the library are compiled
     * together by the closure compiler.
     *
     * @param scene Cesium scene.
     * @api
     */
    constructor(protected scene: Scene) {
        this.scene = scene
    }

    /** @param evt */
    private onRemoveOrClearFeature_(evt: VectorSourceEvent) {
        const source = evt.target
        console.assert(source instanceof VectorSource)

        const cancellers = source['olcs_cancellers']
        if (cancellers) {
            const feature = evt.feature
            if (feature) {
                // remove
                const id = getUid(feature)
                const canceller = cancellers[id]
                if (canceller) {
                    canceller()
                    delete cancellers[id]
                }
            } else {
                // clear
                for (const key in cancellers) {
                    if (cancellers.hasOwnProperty(key)) {
                        cancellers[key]()
                    }
                }
                source['olcs_cancellers'] = {}
            }
        }
    }

    /**
     * @param layer
     * @param feature OpenLayers feature.
     * @param primitive
     */
    protected setReferenceForPicking(
        layer: PrimitiveLayer,
        feature: Feature,
        primitive: GroundPolylinePrimitive | GroundPrimitive | Primitive | Label | Billboard
    ) {
        primitive.olLayer = layer
        primitive.olFeature = feature
    }

    /**
     * Basics primitive creation using a color attribute. Note that Cesium has 'interior' and
     * outline geometries.
     *
     * @param layer
     * @param feature OpenLayers feature.
     * @param olGeometry OpenLayers geometry.
     * @param geometry
     * @param color
     * @param opt_lineWidth
     * @returns Primitive
     */
    protected createColoredPrimitive(
        layer: PrimitiveLayer,
        feature: Feature,
        olGeometry: OLGeometry,
        geometry: CSGeometry | CircleGeometry,
        color?: CesiumColor,
        opt_lineWidth?: number
    ): Primitive | GroundPrimitive | null {
        const createInstance = function (
            geometry: CSGeometry | CircleGeometry,
            color?: CesiumColor
        ) {
            const instance = new GeometryInstance({
                geometry,
            })
            if (color) {
                instance.attributes = {
                    color: ColorGeometryInstanceAttribute.fromColor(color),
                }
            }
            return instance
        }

        const options: MaterialAppearanceOptions = {
            flat: true, // work with all geometries
            renderState: {
                depthTest: {
                    enabled: true,
                },
            },
        }

        if (opt_lineWidth !== undefined) {
            options.renderState.lineWidth = opt_lineWidth
        }

        const instances = createInstance(geometry, color)

        const heightReference = this.getHeightReference(layer, feature, olGeometry)

        let primitive: GroundPrimitive | Primitive

        if (heightReference === HeightReference.CLAMP_TO_GROUND) {
            if (!('createShadowVolume' in instances.geometry.constructor)) {
                // This is not a ground geometry
                return null
            }
            primitive = new GroundPrimitive({
                geometryInstances: instances,
            })
        } else {
            primitive = new Primitive({
                geometryInstances: instances,
            })
        }

        if (color) {
            primitive.appearance = new MaterialAppearance({
                ...options,
                material: new Material({
                    translucent: color.alpha !== 1,
                    fabric: {
                        type: 'Color',
                        uniforms: {
                            color,
                        },
                    },
                }),
            })
            if (
                primitive instanceof Primitive &&
                (feature.get('olcs_shadows') || layer.get('olcs_shadows'))
            ) {
                primitive.shadows = 1
            }
        }
        this.setReferenceForPicking(layer, feature, primitive)
        return primitive
    }

    /**
     * Return the fill or stroke color from a plain ol style.
     *
     * @param style
     * @param outline
     * @returns {CesiumColor | undefined}
     */
    protected extractColorFromOlStyle(style: Style | Text, outline: boolean) : CesiumColor | undefined {
        const fillColor: OLColorLike | OLColor | PatternDescriptor | null | undefined = style
            .getFill()
            ?.getColor()
        const strokeColor: OLColorLike | OLColor | undefined = style.getStroke()?.getColor()

        let olColor: OLColorLike | OLColor | PatternDescriptor = 'black'
        if (strokeColor && outline) {
            olColor = strokeColor
        } else if (fillColor) {
            olColor = fillColor
        }

        const cesiumColor: CesiumColor | ImageMaterialProperty =  convertColorToCesium(olColor)
        if (cesiumColor instanceof ImageMaterialProperty) {
            if (cesiumColor.color instanceof CesiumColor) {
                return cesiumColor.color
            } else {
                return undefined
            }
        }
        return cesiumColor
    }

    /**
     * Return the width of stroke from a plain ol style.
     *
     * @param style
     * @returns {number}
     */
    protected extractLineWidthFromOlStyle(style: Style | Text) {
        // Handling of line width WebGL limitations is handled by Cesium.
        return style.getStroke()?.getWidth() ?? 1
    }

    /**
     * Create a primitive collection out of two Cesium geometries. Only the OpenLayers style colors
     * will be used.
     */
    protected wrapFillAndOutlineGeometries(
        layer: PrimitiveLayer,
        feature: Feature,
        olGeometry: OLGeometry,
        fillGeometry: CSGeometry | CircleGeometry,
        olStyle: Style,
        outlineGeometry?: CSGeometry | CircleOutlineGeometry
    ): PrimitiveCollection {
        const fillColor : CesiumColor | undefined = this.extractColorFromOlStyle(olStyle, false)
        const outlineColor : CesiumColor | undefined = this.extractColorFromOlStyle(olStyle, true)

        const primitives = new PrimitiveCollection()
        if (olStyle.getFill()) {
            const p1 = this.createColoredPrimitive(
                layer,
                feature,
                olGeometry,
                fillGeometry,
                fillColor
            )
            console.assert(!!p1)
            primitives.add(p1)
        }

        if (olStyle.getStroke() && outlineGeometry) {
            const width = this.extractLineWidthFromOlStyle(olStyle)
            const p2 = this.createColoredPrimitive(
                layer,
                feature,
                olGeometry,
                outlineGeometry,
                outlineColor,
                width
            )
            if (p2) {
                // Some outline geometries are not supported by Cesium in clamp to ground
                // mode. These primitives are skipped.
                primitives.add(p2)
            }
        }

        return primitives
    }

    // Geometry converters

    // FIXME: would make more sense to only accept primitive collection.
    /**
     * Create a Cesium primitive if style has a text component. Eventually return a
     * PrimitiveCollection including current primitive.
     */
    protected addTextStyle(
        layer: PrimitiveLayer,
        feature: Feature,
        geometry: OLGeometry,
        style: Style,
        primitive: Primitive | PrimitiveCollection | GroundPolylinePrimitive
    ): PrimitiveCollection {
        let primitives
        if (!(primitive instanceof PrimitiveCollection)) {
            primitives = new PrimitiveCollection()
            primitives.add(primitive)
        } else {
            primitives = primitive
        }

        const text: Text | null = style.getText()
        if (!text) {
            return primitives
        }
        const label = this.olGeometry4326TextPartToCesium(layer, feature, geometry, text)
        if (label) {
            primitives.add(label)
        }
        return primitives
    }

    /**
     * Add a billboard to a Cesium.BillboardCollection. Overriding this wrapper allows manipulating
     * the billboard options.
     *
     * @param billboards
     * @param bbOptions
     * @param layer
     * @param feature OpenLayers feature.
     * @param geometry
     * @param style
     * @returns Newly created billboard
     * @api
     */
    csAddBillboard(
        billboards: BillboardCollection,
        bbOptions: Parameters<BillboardCollection['add']>[0] | undefined,
        layer: PrimitiveLayer,
        feature: Feature,
        geometry: OLGeometry,
        style: Style
    ): Billboard {
        if (bbOptions && !bbOptions.eyeOffset) {
            bbOptions.eyeOffset = this.defaultBillboardEyeOffset_
        }
        const bb = billboards.add(bbOptions)
        this.setReferenceForPicking(layer, feature, bb)
        return bb
    }

    /**
     * Convert an OpenLayers circle geometry to Cesium.
     *
     * @api
     */
    olCircleGeometryToCesium(
        layer: PrimitiveLayer,
        feature: Feature,
        olGeometry: Circle,
        projection: ProjectionLike,
        olStyle: Style
    ): PrimitiveCollection {
        olGeometry = olGeometryCloneTo4326(olGeometry, projection)
        console.assert(olGeometry.getType() == 'Circle')

        // ol.Coordinate
        const olCenter = olGeometry.getCenter()
        const height = olCenter.length == 3 ? olCenter[2] : 0.0
        const olPoint = olCenter.slice()
        olPoint[0] += olGeometry.getRadius()

        // Cesium
        const center: Cartesian3 = ol4326CoordinateToCesiumCartesian(olCenter)
        const point: Cartesian3 = ol4326CoordinateToCesiumCartesian(olPoint)

        // Accurate computation of straight distance
        const radius = Cartesian3.distance(center, point)

        const fillGeometry = new CircleGeometry({
            center,
            radius,
            height,
        })

        let outlinePrimitive: Primitive | GroundPrimitive | GroundPolylinePrimitive | null = null
        let outlineGeometry
        if (
            this.getHeightReference(layer, feature, olGeometry) === HeightReference.CLAMP_TO_GROUND
        ) {
            const width = this.extractLineWidthFromOlStyle(olStyle)
            if (width) {
                const circlePolygon = olCreateCircularPolygon(olGeometry.getCenter(), radius)
                const positions = ol4326CoordinateArrayToCsCartesians(
                    circlePolygon.getLinearRing(0)!.getCoordinates()
                )
                const op = (outlinePrimitive = new GroundPolylinePrimitive({
                    geometryInstances: new GeometryInstance({
                        geometry: new GroundPolylineGeometry({ positions, width }),
                    }),
                    appearance: new PolylineMaterialAppearance({
                        material: this.olStyleToCesium(feature, olStyle, true),
                    }),
                    classificationType: ClassificationType.TERRAIN,
                }))
                waitReady(outlinePrimitive).then(() => {
                    this.setReferenceForPicking(layer, feature, op._primitive)
                })
            }
        } else {
            outlineGeometry = new CircleOutlineGeometry({
                center,
                radius,
                extrudedHeight: height,
                height,
            })
        }

        const primitives = this.wrapFillAndOutlineGeometries(
            layer,
            feature,
            olGeometry,
            fillGeometry,
            olStyle,
            outlineGeometry
        )

        if (outlinePrimitive) {
            primitives.add(outlinePrimitive)
        }
        return this.addTextStyle(layer, feature, olGeometry, olStyle, primitives)
    }

    /**
     * Convert an OpenLayers line string geometry to Cesium.
     *
     * @api
     */
    olLineStringGeometryToCesium(
        layer: PrimitiveLayer,
        feature: Feature,
        olGeometry: LineString,
        projection: ProjectionLike,
        olStyle: Style
    ): PrimitiveCollection {
        olGeometry = olGeometryCloneTo4326(olGeometry, projection)
        console.assert(olGeometry.getType() == 'LineString')

        const positions = ol4326CoordinateArrayToCsCartesians(olGeometry.getCoordinates())
        const width = this.extractLineWidthFromOlStyle(olStyle)

        let outlinePrimitive: Primitive | GroundPolylinePrimitive
        const heightReference = this.getHeightReference(layer, feature, olGeometry)

        const appearance = new PolylineMaterialAppearance({
            material: this.olStyleToCesium(feature, olStyle, true),
        })
        if (heightReference === HeightReference.CLAMP_TO_GROUND) {
            const geometry = new GroundPolylineGeometry({
                positions,
                width,
            })
            const op = (outlinePrimitive = new GroundPolylinePrimitive({
                appearance,
                geometryInstances: new GeometryInstance({
                    geometry,
                }),
            }))
            waitReady(outlinePrimitive).then(() => {
                this.setReferenceForPicking(layer, feature, op._primitive)
            })
        } else {
            const geometry = new PolylineGeometry({
                positions,
                width,
                vertexFormat: appearance.vertexFormat,
            })
            outlinePrimitive = new Primitive({
                appearance,
                geometryInstances: new GeometryInstance({
                    geometry,
                }),
            })
        }

        this.setReferenceForPicking(layer, feature, outlinePrimitive)

        return this.addTextStyle(layer, feature, olGeometry, olStyle, outlinePrimitive)
    }

    /**
     * Convert an OpenLayers polygon geometry to Cesium.
     *
     * @api
     */
    olPolygonGeometryToCesium(
        layer: PrimitiveLayer,
        feature: Feature,
        olGeometry: Polygon,
        projection: ProjectionLike,
        olStyle: Style
    ): PrimitiveCollection {
        olGeometry = olGeometryCloneTo4326(olGeometry, projection)
        console.assert(olGeometry.getType() == 'Polygon')

        const heightReference = this.getHeightReference(layer, feature, olGeometry)

        let fillGeometry, outlineGeometry
        let outlinePrimitive: GroundPolylinePrimitive | null = null
        if (
            olGeometry.getCoordinates()[0].length == 5 &&
            feature.get('olcs.polygon_kind') === 'rectangle'
        ) {
            // Create a rectangle according to the longitude and latitude curves
            const coordinates = olGeometry.getCoordinates()[0]
            // Extract the West, South, East, North coordinates
            const extent = boundingExtent(coordinates)
            const rectangle = Rectangle.fromDegrees(extent[0], extent[1], extent[2], extent[3])

            // Extract the average height of the vertices
            let maxHeight = 0.0
            if (coordinates[0].length == 3) {
                for (const coordinate of coordinates) {
                    maxHeight = Math.max(maxHeight, coordinate[2])
                }
            }

            const featureExtrudedHeight = feature.get('olcs_extruded_height')

            // Render the cartographic rectangle
            fillGeometry = new RectangleGeometry({
                ellipsoid: Ellipsoid.WGS84,
                rectangle,
                height: maxHeight,
                extrudedHeight: featureExtrudedHeight,
            })

            outlineGeometry = new RectangleOutlineGeometry({
                ellipsoid: Ellipsoid.WGS84,
                rectangle,
                height: maxHeight,
                extrudedHeight: featureExtrudedHeight,
            })
        } else {
            const rings = olGeometry.getLinearRings()
            const hierarchy: PolygonHierarchy = {
                positions: [],
                holes: [],
            }
            const polygonHierarchy: PolygonHierarchy = hierarchy
            console.assert(rings.length > 0)

            for (let i = 0; i < rings.length; ++i) {
                const olPos = rings[i].getCoordinates()
                const positions = ol4326CoordinateArrayToCsCartesians(olPos)
                console.assert(positions && positions.length > 0)
                if (i === 0) {
                    hierarchy.positions = positions
                } else {
                    hierarchy.holes.push({
                        positions,
                        holes: [],
                    })
                }
            }

            const featureExtrudedHeight = feature.get('olcs_extruded_height')

            fillGeometry = new PolygonGeometry({
                polygonHierarchy,
                perPositionHeight: true,
                extrudedHeight: featureExtrudedHeight,
            })

            // Since Cesium doesn't yet support Polygon outlines on terrain yet (coming soon...?)
            // we don't create an outline geometry if clamped, but instead do the polyline method
            // for each ring. Most of this code should be removeable when Cesium adds
            // support for Polygon outlines on terrain.
            if (heightReference === HeightReference.CLAMP_TO_GROUND) {
                const width = this.extractLineWidthFromOlStyle(olStyle)
                if (width > 0) {
                    const positions: Cartesian3[][] = [hierarchy.positions]
                    if (hierarchy.holes) {
                        for (const hole of hierarchy.holes) {
                            positions.push(hole.positions)
                        }
                    }
                    const appearance = new PolylineMaterialAppearance({
                        material: this.olStyleToCesium(feature, olStyle, true),
                    })
                    const geometryInstances = []
                    for (const linePositions of positions) {
                        const polylineGeometry = new GroundPolylineGeometry({
                            positions: linePositions,
                            width,
                        })
                        geometryInstances.push(
                            new GeometryInstance({
                                geometry: polylineGeometry,
                            })
                        )
                    }
                    outlinePrimitive = new GroundPolylinePrimitive({
                        appearance,
                        geometryInstances,
                    })
                    waitReady(outlinePrimitive).then(() => {
                        if (outlinePrimitive) {
                            this.setReferenceForPicking(layer, feature, outlinePrimitive._primitive)
                        }
                    })
                }
            } else {
                // Actually do the normal polygon thing. This should end the removable
                // section of code described above.
                outlineGeometry = new PolygonOutlineGeometry({
                    polygonHierarchy: hierarchy,
                    perPositionHeight: true,
                    extrudedHeight: featureExtrudedHeight,
                })
            }
        }

        const primitives = this.wrapFillAndOutlineGeometries(
            layer,
            feature,
            olGeometry,
            fillGeometry,
            olStyle,
            outlineGeometry
        )

        if (outlinePrimitive) {
            primitives.add(outlinePrimitive)
        }

        return this.addTextStyle(layer, feature, olGeometry, olStyle, primitives)
    }

    /** @api */
    getHeightReference(
        layer: PrimitiveLayer,
        feature: Feature,
        geometry: OLGeometry
    ): HeightReference {
        // Read from the geometry
        let altitudeMode = geometry.get('altitudeMode')

        // Or from the feature
        if (altitudeMode === undefined) {
            altitudeMode = feature.get('altitudeMode')
        }

        // Or from the layer
        if (altitudeMode === undefined) {
            altitudeMode = layer.get('altitudeMode')
        }

        let heightReference = HeightReference.NONE
        if (altitudeMode === 'clampToGround') {
            heightReference = HeightReference.CLAMP_TO_GROUND
        } else if (altitudeMode === 'relativeToGround') {
            heightReference = HeightReference.RELATIVE_TO_GROUND
        }

        return heightReference
    }

    /**
     * Convert a point geometry to a Cesium BillboardCollection.
     *
     * @param {ol.layer.Vector | ol.layer.Image} layer
     * @param {!ol.Feature} feature OpenLayers feature..
     * @param {!ol.geom.Point} olGeometry OpenLayers point geometry.
     * @param {!ol.ProjectionLike} projection
     * @param {!ol.style.Style} style
     * @param {!ol.style.Image} imageStyle
     * @param {!BillboardCollection} billboards
     * @param {function(!Billboard)} [opt_newBillboardCallback] Called when the new billboard is
     *   added.
     * @api
     */
    createBillboardFromImage(
        layer: PrimitiveLayer,
        feature: Feature,
        olGeometry: Point,
        projection: ProjectionLike,
        style: Style,
        imageStyle: ImageStyle,
        billboards: BillboardCollection,
        opt_newBillboardCallback?: (bb: Billboard) => void
    ) {
        if (imageStyle instanceof OLStyleIcon) {
            // make sure the image is scheduled for load
            imageStyle.load()
        }

        const image : HTMLImageElement | HTMLCanvasElement | HTMLVideoElement | ImageBitmap | null = imageStyle.getImage(1) // get normal density
        const isImageLoaded = function (image: HTMLImageElement) {
            return (
                image.src != '' &&
                image.naturalHeight != 0 &&
                image.naturalWidth != 0 &&
                image.complete
            )
        }
        const self = this
        const reallyCreateBillboard = function () {
            if (!image) {
                return
            }
            if (
                !(
                    typeof image === 'string' ||
                    image instanceof HTMLCanvasElement
                )
            ) {
                return
            }
            const center = olGeometry.getCoordinates()
            const position = ol4326CoordinateToCesiumCartesian(center)
            let color
            const opacity = imageStyle.getOpacity()
            if (opacity !== undefined) {
                color = new CesiumColor(1.0, 1.0, 1.0, opacity)
            }

            const scale : number | Size = imageStyle.getScale()
            if (Array.isArray(scale)) {
                return
            }
            const heightReference = self.getHeightReference(layer, feature, olGeometry)

            const bbOptions: Parameters<BillboardCollection['add']>[0] = {
                image,
                color,
                scale,
                heightReference,
                position,
            }

            // merge in cesium options from openlayers feature
            Object.assign(bbOptions, feature.get('cesiumOptions'))

            if (imageStyle instanceof OLStyleIcon) {
                const anchor = imageStyle.getAnchor()
                if (anchor) {
                    const xScale = Array.isArray(scale) ? scale[0] : scale
                    const yScale = Array.isArray(scale) ? scale[1] : scale
                    bbOptions.pixelOffset = new Cartesian2(
                        (image.width / 2 - anchor[0]) * xScale,
                        (image.height / 2 - anchor[1]) * yScale
                    )
                }
            }

            const bb = self.csAddBillboard(billboards, bbOptions, layer, feature, olGeometry, style)
            if (opt_newBillboardCallback) {
                opt_newBillboardCallback(bb)
            }
        }.bind(this)

        if (image instanceof Image && !isImageLoaded(image)) {
            // Cesium requires the image to be loaded
            let cancelled = false
            const source = layer.getSource()
            const canceller = function () {
                cancelled = true
            }
            source.on(['removefeature', 'clear'], this.boundOnRemoveOrClearFeatureListener_)
            let cancellers = source['olcs_cancellers']
            if (!cancellers) {
                cancellers = source['olcs_cancellers'] = {}
            }

            const fuid = getUid(feature)
            if (cancellers[fuid]) {
                // When the feature change quickly, a canceller may still be present so
                // we cancel it here to prevent creation of a billboard.
                cancellers[fuid]()
            }
            cancellers[fuid] = canceller

            const listener = function () {
                image.removeEventListener('load', listener)
                if (!billboards.isDestroyed() && !cancelled) {
                    // Create billboard if the feature is still displayed on the map.
                    reallyCreateBillboard()
                }
            }

            image.addEventListener('load', listener)
        } else {
            reallyCreateBillboard()
        }
    }

    /**
     * Convert a point geometry to a Cesium BillboardCollection.
     *
     * @param layer
     * @param feature OpenLayers feature..
     * @param olGeometry OpenLayers point geometry.
     * @param projection
     * @param style
     * @param billboards
     * @param opt_newBillboardCallback Called when the new billboard is added.
     * @returns Primitives
     * @api
     */
    olPointGeometryToCesium(
        layer: PrimitiveLayer,
        feature: Feature,
        olGeometry: Point,
        projection: ProjectionLike,
        style: Style,
        billboards: BillboardCollection,
        opt_newBillboardCallback?: (bb: Billboard) => void
    ): PrimitiveCollection | null {
        console.assert(olGeometry.getType() == 'Point')
        olGeometry = olGeometryCloneTo4326(olGeometry, projection)

        let modelPrimitive: PrimitiveCollection | null = null
        const imageStyle = style.getImage()
        if (imageStyle) {
            const olcsModelFunction: () => ModelStyle =
                olGeometry.get('olcs_model') || feature.get('olcs_model')
            if (olcsModelFunction) {
                modelPrimitive = new PrimitiveCollection()
                const olcsModel = olcsModelFunction()
                const options: ModelFromGltfOptions = {
                    scene: this.scene,
                    ...olcsModel.cesiumOptions,
                }
                if ('fromGltf' in Model) {
                    // pre Cesium v107
                    // @ts-ignore
                    const model = Model.fromGltf(options)
                    modelPrimitive!.add(model)
                } else {
                    Model.fromGltfAsync(options).then((model) => {
                        modelPrimitive!.add(model)
                    })
                }

                if (olcsModel.debugModelMatrix) {
                    modelPrimitive.add(
                        new DebugModelMatrixPrimitive({
                            modelMatrix: olcsModel.debugModelMatrix,
                        })
                    )
                }
            } else {
                this.createBillboardFromImage(
                    layer,
                    feature,
                    olGeometry,
                    projection,
                    style,
                    imageStyle,
                    billboards,
                    opt_newBillboardCallback
                )
            }
        }

        if (style.getText()) {
            return this.addTextStyle(
                layer,
                feature,
                olGeometry,
                style,
                modelPrimitive || new Primitive()
            )
        } else {
            return modelPrimitive
        }
    }

    /**
     * Convert an OpenLayers multi-something geometry to Cesium.
     *
     * @param {ol.layer.Vector | ol.layer.Image} layer
     * @param {!ol.Feature} feature OpenLayers feature..
     * @param {!ol.geom.Geometry} geometry OpenLayers geometry.
     * @param {!ol.ProjectionLike} projection
     * @param {!ol.style.Style} olStyle
     * @param {!BillboardCollection} billboards
     * @param {function(!Billboard)} [opt_newBillboardCallback] Called when the new billboard is
     *   added.
     * @returns {Primitive} Primitives
     * @api
     */
    olMultiGeometryToCesium(
        layer: PrimitiveLayer,
        feature: Feature,
        geometry: OLGeometry,
        projection: ProjectionLike,
        olStyle: Style,
        billboards: BillboardCollection,
        opt_newBillboardCallback: (bb: Billboard) => void
    ) {
        // Do not reproject to 4326 now because it will be done later.

        switch (geometry.getType()) {
            case 'MultiPoint': {
                const points = (geometry as MultiPoint).getPoints()
                if (olStyle.getText()) {
                    const primitives = new PrimitiveCollection()
                    points.forEach((geom) => {
                        console.assert(geom)
                        const result = this.olPointGeometryToCesium(
                            layer,
                            feature,
                            geom,
                            projection,
                            olStyle,
                            billboards,
                            opt_newBillboardCallback
                        )
                        if (result) {
                            primitives.add(result)
                        }
                    })
                    return primitives
                } else {
                    points.forEach((geom) => {
                        console.assert(geom)
                        this.olPointGeometryToCesium(
                            layer,
                            feature,
                            geom,
                            projection,
                            olStyle,
                            billboards,
                            opt_newBillboardCallback
                        )
                    })
                    return null
                }
            }
            case 'MultiLineString': {
                const lineStrings = (geometry as MultiLineString).getLineStrings()
                // FIXME: would be better to combine all child geometries in one primitive
                // instead we create n primitives for simplicity.
                const primitives = new PrimitiveCollection()
                lineStrings.forEach((geom) => {
                    const p = this.olLineStringGeometryToCesium(
                        layer,
                        feature,
                        geom,
                        projection,
                        olStyle
                    )
                    primitives.add(p)
                })
                return primitives
            }
            case 'MultiPolygon': {
                const polygons = (geometry as MultiPolygon).getPolygons()
                // FIXME: would be better to combine all child geometries in one primitive
                // instead we create n primitives for simplicity.
                const primitives = new PrimitiveCollection()
                polygons.forEach((geom) => {
                    const p = this.olPolygonGeometryToCesium(
                        layer,
                        feature,
                        geom,
                        projection,
                        olStyle
                    )
                    primitives.add(p)
                })
                return primitives
            }
            default:
                console.assert(false, `Unhandled multi geometry type${geometry.getType()}`)
        }
    }

    /**
     * Convert an OpenLayers text style to Cesium.
     *
     * @api
     */
    olGeometry4326TextPartToCesium(
        layer: PrimitiveLayer,
        feature: Feature,
        geometry: OLGeometry,
        style: Text
    ): LabelCollection | null {
        const text : string | string[] | undefined = style.getText()
        if (!text || Array.isArray(text)) {
            return null
        }

        const labels = new LabelCollection({ scene: this.scene })
        // TODO: export and use the text draw position from OpenLayers .
        // See src/ol/render/vector.js
        const extentCenter = getCenter(geometry.getExtent())
        if (geometry instanceof olGeomSimpleGeometry) {
            const first = geometry.getFirstCoordinate()
            extentCenter[2] = first.length == 3 ? first[2] : 0.0
        }
        const options: Parameters<LabelCollection['add']>[0] = {
            position: ol4326CoordinateToCesiumCartesian(extentCenter),
            text,
            heightReference: this.getHeightReference(layer, feature, geometry)
        }

        const offsetX = style.getOffsetX()
        const offsetY = style.getOffsetY()
        if (offsetX != 0 || offsetY != 0) {
            options.pixelOffset = new Cartesian2(offsetX, offsetY)
        }

        options.font = style.getFont() || '10px sans-serif' // OpenLayers default

        let labelStyle = undefined
        if (style.getFill()) {
            options.fillColor = this.extractColorFromOlStyle(style, false)
            labelStyle = LabelStyle.FILL
        }
        if (style.getStroke()) {
            options.outlineWidth = this.extractLineWidthFromOlStyle(style)
            options.outlineColor = this.extractColorFromOlStyle(style, true)
            labelStyle = LabelStyle.OUTLINE
        }
        if (style.getFill() && style.getStroke()) {
            labelStyle = LabelStyle.FILL_AND_OUTLINE
        }
        options.style = labelStyle

        let horizontalOrigin
        switch (style.getTextAlign()) {
            case 'left':
                horizontalOrigin = HorizontalOrigin.LEFT
                break
            case 'right':
                horizontalOrigin = HorizontalOrigin.RIGHT
                break
            case 'center':
            default:
                horizontalOrigin = HorizontalOrigin.CENTER
        }
        options.horizontalOrigin = horizontalOrigin

        if (style.getTextBaseline()) {
            let verticalOrigin
            switch (style.getTextBaseline()) {
                case 'top':
                    verticalOrigin = VerticalOrigin.TOP
                    break
                case 'middle':
                    verticalOrigin = VerticalOrigin.CENTER
                    break
                case 'bottom':
                    verticalOrigin = VerticalOrigin.BOTTOM
                    break
                case 'alphabetic':
                    verticalOrigin = VerticalOrigin.TOP
                    break
                case 'hanging':
                    verticalOrigin = VerticalOrigin.BOTTOM
                    break
                default:
                    console.assert(false, `unhandled baseline ${style.getTextBaseline()}`)
            }
            options.verticalOrigin = verticalOrigin
        }

        const l = labels.add(options)
        this.setReferenceForPicking(layer, feature, l)
        return labels
    }

    /**
     * Convert an OpenLayers style to a Cesium Material.
     *
     * @api
     */
    olStyleToCesium(feature: Feature, style: Style, outline: boolean): Material {
        const fill = style.getFill()
        const stroke = style.getStroke()

        let olColor:
            | OLColorLike
            | OLColor
            | PatternDescriptor
            | CanvasGradient
            | CanvasPattern
            | string
            | null = null

        if (outline && stroke) {
            olColor = stroke.getColor()
        } else if (fill) {
            olColor = fill.getColor()
        }
        if (!olColor) {
            throw new Error('Could not find a matching color')
        }
        const color: CesiumColor | ImageMaterialProperty = convertColorToCesium(olColor)

        const lineDash = stroke?.getLineDash()
        if (outline && lineDash) {
            return Material.fromType('PolylineDash', {
                dashPattern: dashPattern(lineDash),
                color,
            })
        } else {
            return Material.fromType('Color', {
                color,
            })
        }
    }

    /**
     * Compute OpenLayers plain style. Evaluates style function, blend arrays, get default style.
     *
     * @api
     */
    computePlainStyle(
        layer: PrimitiveLayer,
        feature: Feature,
        fallbackStyleFunction: StyleFunction | undefined,
        resolution: number
    ): Style[] | null {
        const featureStyleFunction: StyleFunction | undefined = feature.getStyleFunction()

        let style: void | Style | Style[] | null = null

        if (featureStyleFunction) {
            style = featureStyleFunction(feature, resolution)
        }

        if (!style && fallbackStyleFunction) {
            style = fallbackStyleFunction(feature, resolution)
        }

        if (!style) {
            // The feature must not be displayed
            return null
        }

        // FIXME combine materials as in cesium-materials-pack?
        // then this function must return a custom material
        // More simply, could blend the colors like described in
        // http://en.wikipedia.org/wiki/Alpha_compositing
        return Array.isArray(style) ? style : [style]
    }

    protected getGeometryFromFeature(
        feature: Feature,
        style: Style,
        opt_geom?: OLGeometry
    ): OLGeometry | undefined {
        if (opt_geom) {
            return opt_geom
        }

        const geom3d: OLGeometry = feature.get('olcs.3d_geometry')
        if (geom3d && geom3d instanceof OLGeometry) {
            return geom3d
        }

        if (style) {
            const geomFuncRes = style.getGeometryFunction()(feature)
            if (geomFuncRes instanceof OLGeometry) {
                return geomFuncRes
            }
        }

        return feature.getGeometry()
    }

    /**
     * Convert one OpenLayers feature up to a collection of Cesium primitives.
     *
     * @api
     */
    olFeatureToCesium(
        layer: PrimitiveLayer,
        feature: Feature,
        style: Style,
        context: OlFeatureToCesiumContext,
        opt_geom?: OLGeometry
    ): PrimitiveCollection | null {
        const geom: OLGeometry | undefined = this.getGeometryFromFeature(feature, style, opt_geom)

        if (!geom) {
            // OpenLayers features may not have a geometry
            // See http://geojson.org/geojson-spec.html#feature-objects
            return null
        }

        const proj = context.projection
        const newBillboardAddedCallback = function (bb: Billboard) {
            const featureBb = context.featureToCesiumMap[getUid(feature)]
            if (featureBb instanceof Array) {
                featureBb.push(bb)
            } else {
                context.featureToCesiumMap[getUid(feature)] = [bb]
            }
        }

        switch (geom.getType()) {
            case 'GeometryCollection':
                const primitives = new PrimitiveCollection()
                ;(geom as GeometryCollection).getGeometriesArray().forEach((geom) => {
                    if (geom) {
                        const prims = this.olFeatureToCesium(layer, feature, style, context, geom)
                        if (prims) {
                            primitives.add(prims)
                        }
                    }
                })
                return primitives
            case 'Point':
                const bbs = context.billboards
                const result = this.olPointGeometryToCesium(
                    layer,
                    feature,
                    geom as Point,
                    proj,
                    style,
                    bbs,
                    newBillboardAddedCallback
                )
                if (!result) {
                    // no wrapping primitive
                    return null
                } else {
                    return result
                }
            case 'Circle':
                return this.olCircleGeometryToCesium(layer, feature, geom as Circle, proj, style)
            case 'LineString':
                return this.olLineStringGeometryToCesium(
                    layer,
                    feature,
                    geom as LineString,
                    proj,
                    style
                )
            case 'Polygon':
                return this.olPolygonGeometryToCesium(layer, feature, geom as Polygon, proj, style)
            case 'MultiPoint':
                return (
                    this.olMultiGeometryToCesium(
                        layer,
                        feature,
                        geom as MultiPoint,
                        proj,
                        style,
                        context.billboards,
                        newBillboardAddedCallback
                    ) || null
                )
            case 'MultiLineString':
                return (
                    this.olMultiGeometryToCesium(
                        layer,
                        feature,
                        geom as MultiLineString,
                        proj,
                        style,
                        context.billboards,
                        newBillboardAddedCallback
                    ) || null
                )
            case 'MultiPolygon':
                return (
                    this.olMultiGeometryToCesium(
                        layer,
                        feature,
                        geom as MultiPolygon,
                        proj,
                        style,
                        context.billboards,
                        newBillboardAddedCallback
                    ) || null
                )
            case 'LinearRing':
                throw new Error('LinearRing should only be part of polygon.')
            default:
                throw new Error(`Ol geom type not handled : ${geom.getType()}`)
        }
    }

    /**
     * Convert an OpenLayers vector layer to Cesium primitive collection. For each feature, the
     * associated primitive will be stored in `featurePrimitiveMap`.
     *
     * @api
     */
    olVectorLayerToCesium(
        olLayer: VectorLayer<VectorSource>,
        olView: View,
        featurePrimitiveMap: Record<number, PrimitiveCollection>
    ): VectorLayerCounterpart {
        const proj = olView.getProjection()
        const resolution = olView.getResolution()

        if (resolution === undefined || !proj) {
            console.assert(false, 'View not ready')
            // an assertion is not enough for closure to assume resolution and proj
            // are defined
            throw new Error('View not ready')
        }

        let source = olLayer.getSource()
        if (source instanceof OLClusterSource) {
            source = source.getSource()
        }

        console.assert(source instanceof VectorSource)
        const features: Feature<OLGeometry>[] | undefined = source?.getFeatures()
        if (!features) {
            throw new Error('Features missing')
        }
        const counterpart = new VectorLayerCounterpart(proj, this.scene)
        const context = counterpart.context
        for (const feature of features) {
            if (!feature) {
                continue
            }
            const layerStyle: StyleFunction | undefined = olLayer.getStyleFunction()
            const styles = this.computePlainStyle(olLayer, feature, layerStyle, resolution)
            if (!styles?.length) {
                // only 'render' features with a style
                continue
            }

            let primitives: PrimitiveCollection | null = null
            for (const style of styles) {
                const prims = this.olFeatureToCesium(olLayer, feature, style, context)
                if (prims) {
                    if (!primitives) {
                        primitives = prims
                    } else {
                        let i = 0,
                            prim: Primitive | void
                        while ((prim = prims.get(i))) {
                            primitives.add(prim)
                            i++
                        }
                    }
                }
            }
            if (!primitives) {
                continue
            }
            featurePrimitiveMap[getUid(feature)] = primitives
            counterpart.getRootPrimitive().add(primitives)
        }

        return counterpart
    }

    /**
     * Convert an OpenLayers feature to Cesium primitive collection.
     *
     * @api
     */
    convert(
        layer: VectorLayer<VectorSource>,
        view: View,
        feature: Feature,
        context: OlFeatureToCesiumContext
    ): PrimitiveCollection | null {
        const proj = view.getProjection()
        const resolution = view.getResolution()

        if (resolution == undefined || !proj) {
            return null
        }

        const layerStyle: StyleFunction | undefined = layer.getStyleFunction()

        const styles = this.computePlainStyle(layer, feature, layerStyle, resolution)

        if (!styles || !styles.length) {
            // only 'render' features with a style
            return null
        }

        context.projection = proj

        let primitives: PrimitiveCollection | null = null
        for (let i = 0; i < styles.length; i++) {
            const prims = this.olFeatureToCesium(layer, feature, styles[i], context)
            if (!primitives) {
                primitives = prims
            } else if (prims) {
                let i = 0,
                    prim
                while ((prim = prims.get(i))) {
                    primitives.add(prim)
                    i++
                }
            }
        }
        return primitives
    }
}

/**
 * Transform a canvas line dash pattern to a Cesium dash pattern See
 * https://com/learn/cesiumjs/ref-doc/PolylineDashMaterialProperty.html#dashPattern
 *
 * @param lineDash
 */
export function dashPattern(lineDash: number[]): number {
    if (lineDash.length < 2) {
        lineDash = [1, 1]
    }
    const segments = lineDash.length % 2 === 0 ? lineDash : [...lineDash, ...lineDash]
    const total = segments.reduce((a, b) => a + b, 0)
    const div = total / 16
    // create a 16 bit binary string
    let binaryString = segments
        .map((segment, index) => {
            // we alternate between 1 and 0
            const digit = index % 2 === 0 ? '1' : '0'
            // We scale the segment length to fit 16 slots.
            let count = Math.round(segment / div)
            if (index === 0 && count === 0) {
                // We need to start with a 1
                count = 1
            }
            return digit.repeat(count)
        })
        .join('')

    // We rounded so it might be that the string is too short or too long.
    // We try to fix it by padding or truncating the string.
    if (binaryString.length < 16) {
        binaryString = binaryString.padEnd(16, '0')
    } else if (binaryString.length > 16) {
        binaryString = binaryString.substring(0, 16)
    }
    if (binaryString[15] === '1') {
        // We need to really finish with a 0
        binaryString = binaryString.substring(0, 15) + '0'
    }
    console.assert(binaryString.length === 16)
    return parseInt(binaryString, 2)
}
