/**
 * This file was copied over from the openlayers file "ol/interaction/Modify.js", version 7.1.0 and
 * modified to handle correctly the case where the geometries drawn are not linear but geodesic.
 *
 * Changes:
 * - Add subsegmentsFunction/segmentExtentFunction to support geodesic hit detection/extent.
 * - Add pointerWrapX to normalize pointer coordinates around world wrap.
 */

import type { Map } from 'ol'
import type { Circle, Geometry, GeometryCollection, LineString, MultiLineString, MultiPoint, MultiPolygon, Polygon, SimpleGeometry } from 'ol/geom'
import type { Layer } from 'ol/layer'
import type { Pixel } from 'ol/pixel'
import type { FlatStyleLike } from 'ol/style/flat'

import { equals as arrayEquals } from 'ol/array'
import Collection from 'ol/Collection'
import CollectionEventType from 'ol/CollectionEventType'
import { wrapX as wrapXCoordinate } from 'ol/coordinate'
import {
    closestOnSegment,
    distance as coordinateDistance,
    equals as coordinatesEqual,
    squaredDistance as squaredCoordinateDistance,
    squaredDistanceToSegment,
    type Coordinate,
} from 'ol/coordinate'
import {
    altKeyOnly,
    always,
    primaryAction,
    singleClick,
    type Condition,
} from 'ol/events/condition'
import BaseEvent from 'ol/events/Event'
import EventType from 'ol/events/EventType'
import {
    boundingExtent,
    buffer as bufferExtent,
    createOrUpdateFromCoordinate as createExtent,
    type Extent,
} from 'ol/extent'
import Feature, { type FeatureLike } from 'ol/Feature'
import Point from 'ol/geom/Point'
import { fromCircle } from 'ol/geom/Polygon'
import PointerInteraction, {
    type Options as PointerInteractionOptions,
} from 'ol/interaction/Pointer'
import BaseVectorLayer from 'ol/layer/BaseVector'
import VectorLayer from 'ol/layer/Vector'
import MapBrowserEvent from 'ol/MapBrowserEvent'
import MapBrowserEventType from 'ol/MapBrowserEventType'
import {
    fromUserCoordinate,
    fromUserExtent,
    getUserProjection,
    toUserCoordinate,
    toUserExtent,
    type ProjectionLike,
} from 'ol/proj'
import CanvasVectorLayerRenderer from 'ol/renderer/canvas/VectorLayer';
import VectorSource, { type VectorSourceEvent } from 'ol/source/Vector'
import RBush from 'ol/structs/RBush'
import { createEditingStyle, type StyleFunction, type StyleLike } from 'ol/style/Style'
import { getUid } from 'ol/util'

/**
 * The segment index assigned to a circle's center when breaking up a circle.
 */
const CIRCLE_CENTER_INDEX = 0
/**
 * The segment index assigned to a circle's circumference when breaking up a circle.
 */
const CIRCLE_CIRCUMFERENCE_INDEX = 1

const tempExtent: Extent = [0, 0, 0, 0]

export enum ModifyEventType {
    MODIFYSTART = 'modifystart',
    MODIFYEND = 'modifyend',
}

/**
 * A line segment between two coordinates (2 coordinates, 2D).
 */
export type Segment = [Coordinate, Coordinate]

export interface SegmentData {
    depth?: number[]
    feature: FeatureLike
    geometry: SimpleGeometry
    index?: number
    segment: Segment
    featureSegments?: SegmentData[]
}

/**
 * Split a segment into subsegments (e.g. geodesic pieces) within an optional view extent.
 */
export type SubsegmentsFunction = (
    feature: FeatureLike,
    index: number,
    viewExtent: Extent
) => Segment[]

/**
 * Compute the extent for a specific segment (matching the subsegments geometry).
 */
export type SegmentExtentFunction = (feature: FeatureLike, index: number) => Extent | undefined

export interface Options extends PointerInteractionOptions {
    condition?: Condition
    deleteCondition?: Condition
    insertVertexCondition?: Condition
    pixelTolerance?: number
    style?: StyleLike | FlatStyleLike
    source?: VectorSource
    hitDetection?: boolean | BaseVectorLayer<FeatureLike, VectorSource, CanvasVectorLayerRenderer> | null
    features?: Collection<Feature<SimpleGeometry>>
    wrapX?: boolean
    pointerWrapX?: boolean
    snapToPointer?: boolean
    segmentExtentFunction?: SegmentExtentFunction
    subsegmentsFunction?: SubsegmentsFunction
}

/**
 * Events emitted by Modify instances.
 */
export class ModifyEvent extends BaseEvent {
    features: Collection<FeatureLike>
    mapBrowserEvent: MapBrowserEvent<PointerEvent | KeyboardEvent | WheelEvent>

    constructor(
        type: ModifyEventType,
        features: Collection<FeatureLike>,
        mapBrowserEvent: MapBrowserEvent<PointerEvent | KeyboardEvent | WheelEvent>
    ) {
        super(type)
        this.features = features
        this.mapBrowserEvent = mapBrowserEvent
    }
}

/**
 * Compare indices helper.
 */
function compareIndexes(a: SegmentData, b: SegmentData): number {
    return (a.index ?? 0) - (b.index ?? 0)
}

/** Return the default StyleFunction for editing vertices. */
function getDefaultStyleFunction(): StyleFunction {
    const style = createEditingStyle()
    return function () {
        return style['Point']
    }
}

/**
 * Interaction for modifying feature geometries, extended for geodesic segments.
 */
export default class Modify extends PointerInteraction {
    private boundHandleFeatureChange_: (evt: BaseEvent | Event) => void

    private condition_: Condition
    segmentExtentFunction?: SegmentExtentFunction
    subsegmentsFunction?: SubsegmentsFunction

    private defaultDeleteCondition_ = (mapBrowserEvent: MapBrowserEvent<PointerEvent | KeyboardEvent | WheelEvent>) =>
        altKeyOnly(mapBrowserEvent) && singleClick(mapBrowserEvent)

    private deleteCondition_: Condition
    private insertVertexCondition_: Condition

    private pointerWrapX_: boolean

    private vertexFeature_: Feature<Point> | null = null
    private vertexSegments_: Record<string, boolean> | null = null

    private lastPixel_: Pixel = [0, 0]
    private ignoreNextSingleClick_ = false

    private featuresBeingModified_: Collection<FeatureLike> | null = null

    private rBush_: RBush<SegmentData> = new RBush<SegmentData>()
    private pixelTolerance_: number

    private snappedToVertex_ = false
    private changingFeature_ = false

    /**
     * Array of [segmentData, sideIndex] where sideIndex 0 = right, 1 = left of the vertex.
     */
    private dragSegments_: Array<[SegmentData, 0 | 1]> = []

    private overlay_: VectorLayer<VectorSource>

    private source_: VectorSource | null = null
    private hitDetection_: boolean | BaseVectorLayer<FeatureLike, VectorSource, CanvasVectorLayerRenderer> | null = null

    private features_: Collection<Feature<SimpleGeometry>>

    private lastPointerEvent_: MapBrowserEvent<PointerEvent | KeyboardEvent | WheelEvent> | null = null

    private delta_: [number, number] = [0, 0]

    private snapToPointer_: boolean

    constructor(options: Options) {
        super(options as PointerInteractionOptions)

        this.boundHandleFeatureChange_ = this.handleFeatureChange_.bind(this)

        this.condition_ = options.condition ? options.condition : primaryAction

        this.segmentExtentFunction = options.segmentExtentFunction
        this.subsegmentsFunction = options.subsegmentsFunction

        this.deleteCondition_ = options.deleteCondition
            ? options.deleteCondition
            : this.defaultDeleteCondition_

        this.insertVertexCondition_ = options.insertVertexCondition
            ? options.insertVertexCondition
            : always

        this.pointerWrapX_ = !!options.pointerWrapX

        this.overlay_ = new VectorLayer({
            source: new VectorSource({
                useSpatialIndex: false,
                wrapX: !!options.wrapX,
            }),
            style: (options.style as StyleLike) ?? getDefaultStyleFunction(),
            updateWhileAnimating: true,
            updateWhileInteracting: true,
        })

        if (options.features) {
            this.features_ = options.features
        } else if (options.source) {
            this.source_ = options.source
            this.features_ = new Collection(this.source_.getFeatures() as Feature<SimpleGeometry>[])
            this.source_.on(
                'addfeature',
                this.handleSourceAdd_.bind(this)
            )
            this.source_.on(
                'removefeature',
                this.handleSourceRemove_.bind(this)
            )
        } else {
            throw new Error('The modify interaction requires features, a source or a layer')
        }

        if (options.hitDetection) {
            this.hitDetection_ = options.hitDetection
        }

        this.features_.forEach(this.addFeature_.bind(this))
        this.features_.addEventListener(
            CollectionEventType.ADD,
            this.handleFeatureAdd_.bind(this)
        )
        this.features_.addEventListener(
            CollectionEventType.REMOVE,
            this.handleFeatureRemove_.bind(this)
        )

        this.snapToPointer_ =
            options.snapToPointer === undefined ? !this.hitDetection_ : options.snapToPointer

        this.pixelTolerance_ = options.pixelTolerance !== undefined ? options.pixelTolerance : 10
    }

    setActive(active: boolean): void {
        if (this.vertexFeature_ && !active) {
            this.overlay_.getSource()?.removeFeature(this.vertexFeature_)
            this.vertexFeature_ = null
        }
        super.setActive(active)
    }

    setMap(map: Map): void {
        this.overlay_.setMap(map)
        super.setMap(map)
    }

    getOverlay(): VectorLayer<VectorSource> {
        return this.overlay_
    }

    // ---------------------- private helpers ----------------------

    private addFeature_(feature: Feature<SimpleGeometry>): void {
        const geometry = feature.getGeometry() as SimpleGeometry | null
        if (geometry) {
            const writer = this.SEGMENT_WRITERS_[geometry.getType() as keyof typeof this.SEGMENT_WRITERS_]
            if (writer) {
                writer(feature, geometry)
            }
        }
        const map = this.getMap()
        if (map && map.isRendered() && this.getActive()) {
            this.handlePointerAtPixel_(this.lastPixel_, map, undefined)
        }
        feature.addEventListener(EventType.CHANGE, this.boundHandleFeatureChange_)
    }

    private removeFeature_(feature: Feature<SimpleGeometry>): void {
        this.removeFeatureSegmentData_(feature)
        if (this.vertexFeature_ && this.features_.getLength() === 0) {
            this.overlay_.getSource()?.removeFeature(this.vertexFeature_)
            this.vertexFeature_ = null
        }
        feature.removeEventListener(EventType.CHANGE, this.boundHandleFeatureChange_)
    }

    private removeFeatureSegmentData_(feature: FeatureLike): void {
        const rBush = this.rBush_
        const nodesToRemove: SegmentData[] = []
        rBush.forEach((node) => {
            if (feature === node.feature) {
                nodesToRemove.push(node)
            }
        })
        for (let i = nodesToRemove.length - 1; i >= 0; --i) {
            const nodeToRemove = nodesToRemove[i]
            for (let j = this.dragSegments_.length - 1; j >= 0; --j) {
                if (this.dragSegments_ && this.dragSegments_[j]![0] === nodeToRemove) {
                    this.dragSegments_.splice(j, 1)
                }
            }
            if (nodeToRemove) {
                rBush.remove(nodeToRemove)
            }
        }
    }

    private handleSourceAdd_(event: VectorSourceEvent): void {
        if (event.feature) {
            this.features_.push(event.feature as Feature<SimpleGeometry>)
        }
    }

    private handleSourceRemove_(event: VectorSourceEvent): void {
        if (event.feature) {
            this.features_.remove(event.feature as Feature<SimpleGeometry>)
        }
    }

    private handleFeatureAdd_(evt: BaseEvent | Event): void {
        const e = evt as unknown as { element?: Feature<SimpleGeometry> }
        if (e.element) {
            this.addFeature_(e.element)
        }
    }

    private handleFeatureChange_(evt: BaseEvent | Event): void {
        if (!this.changingFeature_) {
            const feature: Feature<SimpleGeometry> = evt.target
            this.removeFeature_(feature)
            this.addFeature_(feature)
        }
    }

    private handleFeatureRemove_(evt: BaseEvent | Event): void {
        const e = evt as unknown as { element?: Feature<SimpleGeometry> }
        if (e.element) {
            this.removeFeature_(e.element)
        }
    }

    private writePointGeometry_(feature: Feature<SimpleGeometry>, geometry: Point): void {
        const coordinates = geometry.getCoordinates()
        const segmentData: SegmentData = {
            feature,
            geometry,
            segment: [coordinates, coordinates],
        }
        this.rBush_.insert(geometry.getExtent(), segmentData)
    }

    private writeMultiPointGeometry_(
        feature: Feature<SimpleGeometry>,
        geometry: MultiPoint
    ): void {
        const points: Coordinate[] = geometry.getCoordinates()
        for (let i = 0; i < points.length; i++) {
            if (!points[i]) {
                continue
            }
            const coordinates = points[i]!
            const segmentData: SegmentData = {
                feature,
                geometry,
                depth: [i],
                index: i,
                segment: [coordinates, coordinates],
            }
            this.rBush_.insert(geometry.getExtent(), segmentData)
        }
    }

    private writeLineStringGeometry_(
        feature: Feature<SimpleGeometry>,
        geometry: LineString
    ): void {
        const coordinates: Coordinate[] = geometry.getCoordinates()
        for (let i = 0; i < coordinates.length - 1; i++) {
            if (!coordinates[i] || !coordinates[i + 1]) {
                continue
            }
            const segment: Segment = [coordinates[i]!, coordinates[i + 1]!]
            const segmentData: SegmentData = {
                feature,
                geometry,
                index: i,
                segment,
            }
            this.rBush_.insert(this.getSegmentDataExtent_(segmentData), segmentData)
        }
    }

    private writeMultiLineStringGeometry_(
        feature: Feature<SimpleGeometry>,
        geometry: MultiLineString
    ): void {
        const lines: Coordinate[][] = geometry.getCoordinates()
        for (let j = 0; j < lines.length; j++) {
            if (!lines[j]) {
                continue
            }
            const coordinates = lines[j]!
            for (let i = 0; i < coordinates.length - 1; i++) {
                if (!coordinates[i] || !coordinates[i + 1]) {
                    continue
                }
                const segment: Segment = [coordinates[i]!, coordinates[i + 1]!]
                const segmentData: SegmentData = {
                    feature,
                    geometry,
                    depth: [j],
                    index: i,
                    segment,
                }
                this.rBush_.insert(this.getSegmentDataExtent_(segmentData), segmentData)
            }
        }
    }

    private writePolygonGeometry_(
        feature: Feature<SimpleGeometry>,
        geometry: Polygon
    ): void {
        const rings: Coordinate[][] = geometry.getCoordinates()
        for (let j = 0; j < rings.length; j++) {
            if (!rings[j]) {
                continue
            }
            const coordinates = rings[j]!
            for (let i = 0; i < coordinates.length - 1; i++) {
                if (!coordinates[i] || !coordinates[i + 1]) {
                    continue
                }
                const segment: Segment = [coordinates[i]!, coordinates[i + 1]!]
                const segmentData: SegmentData = {
                    feature,
                    geometry,
                    depth: [j],
                    index: i,
                    segment,
                }
                this.rBush_.insert(this.getSegmentDataExtent_(segmentData), segmentData)
            }
        }
    }

    private writeMultiPolygonGeometry_(
        feature: Feature<SimpleGeometry>,
        geometry: MultiPolygon
    ): void {
        const polygons: Coordinate[][][] = geometry.getCoordinates()
        for (let k = 0; k < polygons.length; k++) {
            if (!polygons[k]) {
                continue
            }
            const rings = polygons[k]!
            for (let j = 0; j < rings.length; j++) {
                if (!rings[j]) {
                    continue
                }
                const coordinates = rings[j]!
                for (let i = 0; i < coordinates.length - 1; i++) {
                    if (!coordinates[i] || !coordinates[i + 1]) {
                        continue
                    }
                    const segment: Segment = [coordinates[i]!, coordinates[i + 1]!]
                    const segmentData: SegmentData = {
                        feature,
                        geometry,
                        depth: [j, k],
                        index: i,
                        segment,
                    }
                    this.rBush_.insert(this.getSegmentDataExtent_(segmentData), segmentData)
                }
            }
        }
    }

    private writeCircleGeometry_(feature: Feature<SimpleGeometry>, geometry: Circle): void {
        const coordinates = geometry.getCenter()

        const centerSegmentData: SegmentData = {
            feature,
            geometry,
            index: CIRCLE_CENTER_INDEX,
            segment: [coordinates, coordinates],
        }

        const circumferenceSegmentData: SegmentData = {
            feature,
            geometry,
            index: CIRCLE_CIRCUMFERENCE_INDEX,
            segment: [coordinates, coordinates],
        }

        const featureSegments = [centerSegmentData, circumferenceSegmentData]
        centerSegmentData.featureSegments = featureSegments
        circumferenceSegmentData.featureSegments = featureSegments

        this.rBush_.insert(createExtent(coordinates, tempExtent), centerSegmentData)

        let circleGeometry: Circle | Polygon = geometry
        const userProjection = getUserProjection()
        const map = this.getMap()
        if (userProjection && map) {
            const projection = map.getView().getProjection()
            circleGeometry = circleGeometry.clone().transform(userProjection, projection)
            circleGeometry = fromCircle(circleGeometry).transform(projection, userProjection)
        }
        this.rBush_.insert(circleGeometry.getExtent(), circumferenceSegmentData)
    }

    private writeGeometryCollectionGeometry_(
        feature: Feature<SimpleGeometry>,
        geometry: GeometryCollection
    ): void {
        const geometries = geometry.getGeometriesArray()
        for (let i = 0; i < geometries.length; ++i) {
            const g = geometries[i]
            if (!g) {
                continue
            }
            const writer = this.SEGMENT_WRITERS_[g.getType() as keyof typeof this.SEGMENT_WRITERS_]
            if (!writer) {
                continue
            }
            writer(feature, g as SimpleGeometry)
        }
    }

    private SEGMENT_WRITERS_: Record<
        string,
        (feature: Feature<SimpleGeometry>, geometry: Geometry) => void
    > = {
            Point: (feature, geometry) => this.writePointGeometry_(feature, geometry as Point),
            LineString: (feature, geometry) => this.writeLineStringGeometry_(feature, geometry as LineString),
            LinearRing: (feature, geometry) => this.writeLineStringGeometry_(feature, geometry as unknown as LineString),
            Polygon: (feature, geometry) => this.writePolygonGeometry_(feature, geometry as Polygon),
            MultiPoint: (feature, geometry) => this.writeMultiPointGeometry_(feature, geometry as MultiPoint),
            MultiLineString: (feature, geometry) => this.writeMultiLineStringGeometry_(feature, geometry as MultiLineString),
            MultiPolygon: (feature, geometry) => this.writeMultiPolygonGeometry_(feature, geometry as MultiPolygon),
            Circle: (feature, geometry) => this.writeCircleGeometry_(feature, geometry as Circle),
            GeometryCollection: (feature, geometry) => this.writeGeometryCollectionGeometry_(feature, geometry as GeometryCollection),
        }

    // ---------------------- event handling ----------------------

    handleEvent(mapBrowserEvent: MapBrowserEvent<PointerEvent | KeyboardEvent | WheelEvent>): boolean {
        if (!mapBrowserEvent.originalEvent) {
            return true
        }
        this.lastPointerEvent_ = mapBrowserEvent

        let handled: boolean | undefined
        if (
            !mapBrowserEvent.map.getView().getInteracting() &&
            mapBrowserEvent.type === MapBrowserEventType.POINTERMOVE &&
            !this.handlingDownUpSequence
        ) {
            this.handlePointerMove_(mapBrowserEvent)
        }
        if (this.vertexFeature_ && this.deleteCondition_(mapBrowserEvent)) {
            if (
                mapBrowserEvent.type !== MapBrowserEventType.SINGLECLICK ||
                !this.ignoreNextSingleClick_
            ) {
                handled = this.removePoint()
            } else {
                handled = true
            }
        }

        if (mapBrowserEvent.type === MapBrowserEventType.SINGLECLICK) {
            this.ignoreNextSingleClick_ = false
        }

        return super.handleEvent(mapBrowserEvent) && !handled
    }

    handleDragEvent(evt: MapBrowserEvent<PointerEvent | KeyboardEvent | WheelEvent>): void {
        this.ignoreNextSingleClick_ = false
        this.willModifyFeatures_(evt, this.dragSegments_)

        const evtCoordinate = this.getCoordinateFromEvent_(evt)
        if (!evtCoordinate || evtCoordinate.length < 2) {
            return
        }
        const vertex: Coordinate = [
            evtCoordinate[0]! + this.delta_[0],
            evtCoordinate[1]! + this.delta_[1],
        ]
        const features: FeatureLike[] = []
        const geometries: SimpleGeometry[] = []
        for (let i = 0; i < this.dragSegments_.length; i++) {
            if (!this.dragSegments_[i]) {
                continue
            }
            const dragSegment = this.dragSegments_[i]
            if (!dragSegment || !dragSegment[0]) {
                continue
            }
            const segmentData = dragSegment[0]
            const feature = segmentData.feature
            if (!features.includes(feature)) {
                features.push(feature)
            }
            const geometry = segmentData.geometry
            if (!geometries.includes(geometry)) {
                geometries.push(geometry)
            }
            const depth = segmentData.depth

            let coordinates: Coordinate | Coordinate[] | Coordinate[][] | Coordinate[][][] | undefined
            const segment = segmentData.segment
            const index = dragSegment[1]

            while (vertex.length < geometry.getStride()) {
                vertex.push((segment[index][vertex.length]!))
            }

            switch (geometry.getType()) {
                case 'Point':
                    coordinates = vertex
                    segment[0] = vertex
                    segment[1] = vertex
                    break
                case 'MultiPoint':
                    coordinates = (geometry as MultiPoint).getCoordinates()
                    coordinates[segmentData.index!] = vertex
                    segment[0] = vertex
                    segment[1] = vertex
                    break
                case 'LineString':
                    coordinates = (geometry as LineString).getCoordinates()
                    coordinates[segmentData.index! + index] = vertex
                    segment[index] = vertex
                    break
                case 'MultiLineString': {
                    if (!depth || depth.length === 0) {
                        continue
                    }
                    const mlCoords = (geometry as MultiLineString).getCoordinates()
                    const line = mlCoords[depth[0]!]
                    if (!line) {
                        continue
                    }
                    line[segmentData.index! + index] = vertex
                    coordinates = mlCoords
                    segment[index] = vertex
                    break
                }
                case 'Polygon': {
                    if (!depth || depth.length === 0) {
                        continue
                    }
                    const polygonCoords = (geometry as Polygon).getCoordinates()
                    const polygon = polygonCoords[depth[0]!]
                    if (!polygon) {
                        continue
                    }
                    polygon[segmentData.index! + index] = vertex
                    coordinates = polygonCoords
                    segment[index] = vertex
                    break
                }
                case 'MultiPolygon': {
                    if (!depth || depth.length < 2) {
                        continue
                    }
                    const mpCoords = (geometry as MultiPolygon).getCoordinates()
                    const multiPolygon = mpCoords[depth[1]!]
                    if (!multiPolygon) {
                        continue
                    }
                    const ring = multiPolygon[depth[0]!]
                    if (!ring) {
                        continue
                    }
                    ring[segmentData.index! + index] = vertex
                    coordinates = mpCoords
                    segment[index] = vertex
                    break
                }
                case 'Circle':
                    segment[0] = vertex
                    segment[1] = vertex
                    if (segmentData.index === CIRCLE_CENTER_INDEX) {
                        this.changingFeature_ = true
                            ; (geometry as Circle).setCenter(vertex)
                        this.changingFeature_ = false
                    } else {
                        this.changingFeature_ = true
                        const projection = evt.map.getView().getProjection()
                        let radius = coordinateDistance(
                            fromUserCoordinate((geometry as Circle).getCenter(), projection),
                            fromUserCoordinate(vertex, projection)
                        )
                        const userProjection = getUserProjection()
                        if (userProjection) {
                            const circleGeometry = (geometry as Circle)
                                .clone()
                                .transform(userProjection, projection)
                            circleGeometry.setRadius(radius)
                            radius = circleGeometry
                                .transform(projection, userProjection)
                                .getRadius()
                        }
                        ; (geometry as Circle).setRadius(radius)
                        this.changingFeature_ = false
                    }
                    break
                default:
                // pass
            }

            if (coordinates) {
                this.setGeometryCoordinates_(geometry, coordinates)
            }
        }
        this.createOrUpdateVertexFeature_(vertex, features, geometries)
    }

    handleDownEvent(evt: MapBrowserEvent<PointerEvent | KeyboardEvent | WheelEvent>): boolean {
        if (!this.condition_(evt)) {
            return false
        }
        const pixelCoordinate = this.getCoordinateFromEvent_(evt)
        this.handlePointerAtPixel_(evt.pixel, evt.map, pixelCoordinate)
        this.dragSegments_.length = 0
        this.featuresBeingModified_ = null
        const vertexFeature = this.vertexFeature_
        if (vertexFeature) {
            const projection = evt.map.getView().getProjection()
            const insertVertices: SegmentData[] = []
            const vertex = (vertexFeature.getGeometry() as Point).getCoordinates()
            const vertexExtent = boundingExtent([vertex])
            const segmentDataMatches = this.rBush_.getInExtent(vertexExtent)
            const componentSegments: Record<string, [SegmentData | undefined, SegmentData | undefined]> =
                {}
            segmentDataMatches.sort(compareIndexes)
            for (let i = 0; i < segmentDataMatches.length; i++) {
                const segmentDataMatch = segmentDataMatches[i]
                if (!segmentDataMatch) {
                    continue
                }
                const segment = segmentDataMatch.segment
                let uid = getUid(segmentDataMatch.geometry)
                const depth = segmentDataMatch.depth
                if (depth) {
                    uid += '-' + depth.join('-')
                }
                if (!componentSegments[uid]) {
                    componentSegments[uid] = [undefined, undefined]
                }

                if (
                    segmentDataMatch.geometry.getType() === 'Circle' &&
                    segmentDataMatch.index === CIRCLE_CIRCUMFERENCE_INDEX
                ) {
                    const closestVertex = this.closestOnSegmentData(
                        pixelCoordinate,
                        segmentDataMatch,
                        projection
                    )
                    if (closestVertex && coordinatesEqual(closestVertex, vertex) && !componentSegments[uid]![0]) {
                        this.dragSegments_.push([segmentDataMatch, 0])
                        componentSegments[uid]![0] = segmentDataMatch
                    }
                    continue
                }

                if (coordinatesEqual(segment[0], vertex) && !componentSegments[uid]![0]) {
                    this.dragSegments_.push([segmentDataMatch, 0])
                    componentSegments[uid]![0] = segmentDataMatch
                    continue
                }

                if (coordinatesEqual(segment[1], vertex) && !componentSegments[uid]![1]) {
                    if (componentSegments[uid]![0] && componentSegments[uid]![0]!.index === 0) {
                        let coordinates: Coordinate[] | Coordinate[][] = segmentDataMatch.geometry.getCoordinates() as Coordinate[] | Coordinate[][]
                        switch (segmentDataMatch.geometry.getType()) {
                            case 'LineString':
                            case 'MultiLineString':
                                continue
                            case 'MultiPolygon':
                                coordinates = coordinates[depth![1]!] as Coordinate[]
                            // falls through
                            case 'Polygon':
                                if (segmentDataMatch.index !== coordinates[depth![0]!]!.length - 2) {
                                    continue
                                }
                                break
                            default:
                            // pass
                        }
                    }

                    this.dragSegments_.push([segmentDataMatch, 1])
                    componentSegments[uid]![1] = segmentDataMatch
                    continue
                }

                if (
                    getUid(segment) in (this.vertexSegments_ ?? {}) &&
                    !componentSegments[uid]![0] &&
                    !componentSegments[uid]![1] &&
                    this.insertVertexCondition_(evt)
                ) {
                    insertVertices.push(segmentDataMatch)
                }
            }

            if (insertVertices.length) {
                this.willModifyFeatures_(evt, [insertVertices])
            }

            for (let j = insertVertices.length - 1; j >= 0; --j) {
                this.insertVertex_(insertVertices[j]!, vertex.slice())
            }
        }
        return !!this.vertexFeature_
    }

    /**
     * Insert a vertex into the given segment.
     */
    private insertVertex_(segmentData: SegmentData, vertex: Coordinate): void {
        const segment = segmentData.segment
        const feature = segmentData.feature
        const geometry = segmentData.geometry
        const depth = segmentData.depth
        const index = segmentData.index!

        let coordinates: Coordinate[] | Coordinate[][] | Coordinate[][][]

        while (vertex.length < geometry.getStride()) {
            vertex.push(0)
        }

        switch (geometry.getType()) {
            case 'MultiLineString': {
                const coords = (geometry as MultiLineString).getCoordinates()
                coords[depth![0]!]!.splice(index + 1, 0, vertex)
                coordinates = coords
                break
            }
            case 'Polygon': {
                const coords = (geometry as Polygon).getCoordinates()
                coords[depth![0]!]!.splice(index + 1, 0, vertex)
                coordinates = coords
                break
            }
            case 'MultiPolygon': {
                const coords = (geometry as MultiPolygon).getCoordinates()
                coords[depth![1]!]![depth![0]!]!.splice(index + 1, 0, vertex)
                coordinates = coords
                break
            }
            case 'LineString': {
                const coords = (geometry as LineString).getCoordinates()
                coords.splice(index + 1, 0, vertex)
                coordinates = coords
                break
            }
            default:
                return
        }

        this.setGeometryCoordinates_(geometry, coordinates)
        const rTree = this.rBush_
        rTree.remove(segmentData)
        this.updateSegmentIndices_(geometry, index, depth, 1)

        const newSegmentData: SegmentData = {
            segment: [segment[0], vertex],
            feature,
            geometry,
            depth,
            index,
        }
        rTree.insert(this.getSegmentDataExtent_(newSegmentData), newSegmentData)
        this.dragSegments_.push([newSegmentData, 1])

        const newSegmentData2: SegmentData = {
            segment: [vertex, segment[1]],
            feature,
            geometry,
            depth,
            index: index + 1,
        }
        rTree.insert(this.getSegmentDataExtent_(newSegmentData2), newSegmentData2)
        this.dragSegments_.push([newSegmentData2, 0])

        this.ignoreNextSingleClick_ = true
    }


    handleUpEvent(evt: MapBrowserEvent<PointerEvent | KeyboardEvent | WheelEvent>): boolean {
        for (let i = this.dragSegments_.length - 1; i >= 0; --i) {
            if (!this.dragSegments_[i]) {
                continue
            }
            const segmentData = this.dragSegments_[i]![0]
            const geometry = segmentData.geometry
            if (geometry.getType() === 'Circle') {
                const coordinates = (geometry as Circle).getCenter()
                const centerSegmentData = segmentData.featureSegments![0]
                const circumferenceSegmentData = segmentData.featureSegments![1]
                if (!centerSegmentData || !circumferenceSegmentData) {
                    continue
                }
                centerSegmentData.segment[0] = coordinates
                centerSegmentData.segment[1] = coordinates
                circumferenceSegmentData.segment[0] = coordinates
                circumferenceSegmentData.segment[1] = coordinates
                this.rBush_.update(createExtent(coordinates, tempExtent), centerSegmentData)
                let circleGeometry: Circle | Polygon = geometry as Circle
                const userProjection = getUserProjection()
                if (userProjection) {
                    const projection = evt.map.getView().getProjection()
                    circleGeometry = circleGeometry.clone().transform(userProjection, projection)
                    circleGeometry = fromCircle(circleGeometry).transform(projection, userProjection)
                }
                this.rBush_.update(circleGeometry.getExtent(), circumferenceSegmentData)
            } else {
                this.rBush_.update(this.getSegmentDataExtent_(segmentData), segmentData)
            }
        }
        if (this.featuresBeingModified_) {
            this.dispatchEvent(
                new ModifyEvent(ModifyEventType.MODIFYEND, this.featuresBeingModified_, evt)
            )
            this.featuresBeingModified_ = null
        }
        return false
    }

    private handlePointerMove_(evt: MapBrowserEvent<PointerEvent | KeyboardEvent | WheelEvent>): void {
        this.lastPixel_ = evt.pixel
        this.handlePointerAtPixel_(evt.pixel, evt.map, evt.coordinate)
    }

    private handlePointerAtPixel_(
        pixel: Pixel,
        map: Map,
        coordinate?: Coordinate
    ): void {
        const pixelCoordinate: Coordinate =
            (coordinate ? coordinate.slice() : map.getCoordinateFromPixel(pixel))
        const projection = map.getView().getProjection()
        if (this.pointerWrapX_) {
            wrapXCoordinate(pixelCoordinate, projection)
            pixel = map.getPixelFromCoordinate(pixelCoordinate)
        }
        let nodes: SegmentData[] | undefined
        let hitPointGeometry: SimpleGeometry

        if (this.hitDetection_) {
            const layerFilter =
                typeof this.hitDetection_ === 'object'
                    ? (layer: Layer) => layer === this.hitDetection_
                    : undefined
            map.forEachFeatureAtPixel(
                pixel,
                (feature: FeatureLike, _layer: Layer, geometry?: SimpleGeometry) => {
                    geometry = geometry || (feature as Feature<Geometry>).getGeometry()! as SimpleGeometry
                    if (
                        geometry.getType() === 'Point' &&
                        this.features_.getArray().includes(feature as Feature<SimpleGeometry>)
                    ) {
                        hitPointGeometry = geometry
                        const c = geometry.getFlatCoordinates().slice(0, 2)
                        nodes = [
                            {
                                feature,
                                geometry,
                                segment: [c, c],
                            },
                        ]
                    }
                    return true
                },
                { layerFilter }
            )
        }

        const viewExtent = fromUserExtent(createExtent(pixelCoordinate, tempExtent), projection)
        const buffer = map.getView().getResolution()! * this.pixelTolerance_
        const box = toUserExtent(bufferExtent(viewExtent, buffer, tempExtent), projection)

        const sortByDistance = (a: SegmentData, b: SegmentData) => {
            return (
                this.projectedDistanceToSegmentDataSquared(pixelCoordinate, a, projection, box) -
                this.projectedDistanceToSegmentDataSquared(pixelCoordinate, b, projection, box)
            )
        }

        let node: SegmentData | undefined
        let vertex: Coordinate | null | undefined

        if (!nodes) {
            nodes = this.rBush_.getInExtent(box)
        }

        if (nodes && nodes.length > 0) {
            node = nodes.sort(sortByDistance)[0]
            vertex = this.closestOnSegmentData(pixelCoordinate, node!, projection, box)
        }

        if (vertex && node) {
            const closestSegment = node.segment
            const vertexPixel = map.getPixelFromCoordinate(vertex)
            let dist = coordinateDistance(pixel, vertexPixel)
            if (hitPointGeometry! || dist <= this.pixelTolerance_) {
                const vertexSegments: Record<string, boolean> = {}
                vertexSegments[getUid(closestSegment)] = true

                if (!this.snapToPointer_ && vertex.length >= 2 && pixelCoordinate && pixelCoordinate.length >= 2) {
                    this.delta_[0] = vertex[0]! - pixelCoordinate[0]!
                    this.delta_[1] = vertex[1]! - pixelCoordinate[1]!
                }
                if (node.geometry.getType() === 'Circle' && node.index === CIRCLE_CIRCUMFERENCE_INDEX) {
                    this.snappedToVertex_ = true
                    this.createOrUpdateVertexFeature_(vertex, [node.feature], [node.geometry])
                } else {
                    const pixel1 = map.getPixelFromCoordinate(closestSegment[0])
                    const pixel2 = map.getPixelFromCoordinate(closestSegment[1])
                    const squaredDist1 = squaredCoordinateDistance(vertexPixel, pixel1)
                    const squaredDist2 = squaredCoordinateDistance(vertexPixel, pixel2)
                    dist = Math.sqrt(Math.min(squaredDist1, squaredDist2))
                    this.snappedToVertex_ = dist <= this.pixelTolerance_
                    if (this.snappedToVertex_) {
                        vertex = squaredDist1 > squaredDist2 ? closestSegment[1] : closestSegment[0]
                    }
                    this.createOrUpdateVertexFeature_(vertex, [node.feature], [node.geometry])
                    const geometries: Record<string, boolean> = {}
                    geometries[getUid(node.geometry)] = true
                    for (let i = 1; i < nodes.length; i++) {
                        const segment = nodes[i]!.segment
                        if (
                            (coordinatesEqual(closestSegment[0], segment[0]) &&
                                coordinatesEqual(closestSegment[1], segment[1])) ||
                            (coordinatesEqual(closestSegment[0], segment[1]) &&
                                coordinatesEqual(closestSegment[1], segment[0]))
                        ) {
                            const geometryUid = getUid(nodes[i]!.geometry)
                            if (!(geometryUid in geometries)) {
                                geometries[geometryUid] = true
                                vertexSegments[getUid(segment)] = true
                            }
                        } else {
                            break
                        }
                    }
                }

                this.vertexSegments_ = vertexSegments
                return
            }
        }
        if (this.vertexFeature_) {
            this.overlay_.getSource()?.removeFeature(this.vertexFeature_)
            this.vertexFeature_ = null
        }
    }

    private willModifyFeatures_(
        evt: MapBrowserEvent<PointerEvent | KeyboardEvent | WheelEvent>,
        segments: [SegmentData, 0 | 1][]
    ): void
    private willModifyFeatures_(
        evt: MapBrowserEvent<PointerEvent | KeyboardEvent | WheelEvent>,
        segments: Array<Array<[SegmentData, 0 | 1]> | SegmentData[]>
    ): void
    private willModifyFeatures_(
        evt: MapBrowserEvent<PointerEvent | KeyboardEvent | WheelEvent>,
        segments: [SegmentData, 0 | 1][] | Array<Array<[SegmentData, 0 | 1]> | SegmentData[]>
    ): void {
        if (!this.featuresBeingModified_) {
            this.featuresBeingModified_ = new Collection()
            const features = this.featuresBeingModified_.getArray()
            for (let i = 0; i < segments.length; ++i) {
                const segment = segments[i] as SegmentData[]
                for (let s = 0; s < segment.length; ++s) {
                    const item = segment[s]
                    const feature =
                        Array.isArray(item)
                            ? (item[0] as SegmentData).feature
                            : (item as SegmentData).feature
                    if (feature && !features.includes(feature)) {
                        this.featuresBeingModified_.push(feature)
                    }
                }
            }
            if (this.featuresBeingModified_.getLength() === 0) {
                this.featuresBeingModified_ = null
            } else {
                this.dispatchEvent(
                    new ModifyEvent(ModifyEventType.MODIFYSTART, this.featuresBeingModified_, evt)
                )
            }
        }
    }

    private createOrUpdateVertexFeature_(
        coordinates: Coordinate,
        features: FeatureLike[],
        geometries: SimpleGeometry[]
    ): Feature<Point> {
        let vertexFeature = this.vertexFeature_
        if (!vertexFeature) {
            vertexFeature = new Feature(new Point(coordinates))
            this.vertexFeature_ = vertexFeature
            this.overlay_.getSource()?.addFeature(vertexFeature)
        } else {
            const geometry = vertexFeature.getGeometry() as Point
            geometry.setCoordinates(coordinates)
        }
        vertexFeature.set('features', features)
        vertexFeature.set('geometries', geometries)
        return vertexFeature
    }

    removePoint(): boolean {
        if (this.lastPointerEvent_ && this.lastPointerEvent_.type !== MapBrowserEventType.POINTERDRAG) {
            const evt = this.lastPointerEvent_
            this.willModifyFeatures_(evt, this.dragSegments_)
            const removed = this.removeVertex_()
            if (this.featuresBeingModified_) {
                this.dispatchEvent(
                    new ModifyEvent(ModifyEventType.MODIFYEND, this.featuresBeingModified_, evt)
                )
            }
            this.featuresBeingModified_ = null
            return removed
        }
        return false
    }

    private removeVertex_(): boolean {
        const dragSegments = this.dragSegments_
        const segmentsByFeature: Record<
            string,
            { right?: SegmentData; left?: SegmentData; index?: number }
        > = {}
        let deleted = false

        for (let i = dragSegments.length - 1; i >= 0; --i) {
            const dragSegment = dragSegments[i]
            const segmentData = dragSegment![0]
            let uid = getUid(segmentData.feature)
            if (segmentData.depth) {
                uid += '-' + segmentData.depth.join('-')
            }
            if (!(uid in segmentsByFeature)) {
                segmentsByFeature[uid] = {}
            }
            if (dragSegment![1] === 0 && segmentsByFeature[uid]) {
                segmentsByFeature[uid]!.right = segmentData
                segmentsByFeature[uid]!.index = segmentData.index
            } else if (dragSegment![1] === 1 && segmentsByFeature[uid]) {
                segmentsByFeature[uid]!.left = segmentData
                segmentsByFeature[uid]!.index = (segmentData.index ?? 0) + 1
            }
        }

        for (const uid in segmentsByFeature) {
            const right = segmentsByFeature[uid]!.right
            const left = segmentsByFeature[uid]!.left
            let index = segmentsByFeature[uid]!.index ?? 0
            let newIndex = index - 1
            const segmentData: SegmentData = left ?? right!
            if (newIndex < 0) {
                newIndex = 0
            }

            const geometry = segmentData.geometry
            const coordinates: Coordinate[] | Coordinate[][] = geometry.getCoordinates() as Coordinate[] | Coordinate[][]
            let component = coordinates

            deleted = false
            switch (geometry.getType()) {
                case 'MultiLineString':
                    if (coordinates[segmentData.depth![0]!]!.length > 2) {
                        coordinates[segmentData.depth![0]!]!.splice(index, 1)
                        deleted = true
                    }
                    break
                case 'LineString':
                    if (coordinates.length > 2) {
                        coordinates.splice(index, 1)
                        deleted = true
                    }
                    break
                case 'MultiPolygon':
                    component = component[segmentData.depth![1]!] as Coordinate[]
                // falls through
                case 'Polygon':
                    component = component[segmentData.depth![0]!] as Coordinate[]
                    if (component.length > 4) {
                        if (index === component.length - 1) {
                            index = 0
                        }
                        component.splice(index, 1)
                        deleted = true
                        if (index === 0) {
                            component.pop()
                            component.push(component[0]!)
                            newIndex = component.length - 2
                        }
                    }
                    break
                default:
                // pass
            }

            if (deleted) {
                this.setGeometryCoordinates_(segmentData.geometry, coordinates)
                const segments: Coordinate[] = []
                if (left !== undefined) {
                    this.rBush_.remove(left)
                    segments.push(left.segment[0])
                }
                if (right !== undefined) {
                    this.rBush_.remove(right)
                    segments.push(right.segment[1])
                }
                this.updateSegmentIndices_(segmentData.geometry, index, segmentData.depth, -1)
                if (left !== undefined && right !== undefined) {
                    const newSegmentData: SegmentData = {
                        depth: segmentData.depth,
                        feature: segmentData.feature,
                        geometry: segmentData.geometry,
                        index: newIndex,
                        segment: segments as Segment,
                    }
                    this.rBush_.insert(this.getSegmentDataExtent_(newSegmentData), newSegmentData)
                }
                if (this.vertexFeature_) {
                    this.overlay_.getSource()?.removeFeature(this.vertexFeature_)
                    this.vertexFeature_ = null
                }
                dragSegments.length = 0
            }
        }
        return deleted
    }

    private setGeometryCoordinates_(geometry: SimpleGeometry, coordinates: Coordinate | Coordinate[] | Coordinate[][] | Coordinate[][][]): void {
        this.changingFeature_ = true
        geometry.setCoordinates(coordinates)
        this.changingFeature_ = false
    }

    private getSegmentDataExtent_(segmentData: SegmentData): Extent {
        return (
            this.segmentExtentFunction?.(segmentData.feature, segmentData.index ?? 0) ??
            boundingExtent(segmentData.segment)
        )
    }

    private updateSegmentIndices_(
        geometry: SimpleGeometry,
        index: number,
        depth: number[] | undefined,
        delta: number
    ): void {
        this.rBush_.forEachInExtent(geometry.getExtent(), (segmentDataMatch) => {
            if (
                segmentDataMatch.geometry === geometry &&
                (depth === undefined ||
                    segmentDataMatch.depth === undefined ||
                    arrayEquals(segmentDataMatch.depth, depth)) &&
                (segmentDataMatch.index ?? 0) > index
            ) {
                segmentDataMatch.index = (segmentDataMatch.index ?? 0) + delta
            }
        })
    }

    private getCoordinateFromEvent_(evt: MapBrowserEvent<PointerEvent | KeyboardEvent | WheelEvent>): Coordinate {
        const evtCoordinate = evt.coordinate.slice() as Coordinate
        if (this.pointerWrapX_) {
            wrapXCoordinate(evtCoordinate, evt.map.getView().getProjection())
        }
        return evtCoordinate
    }

    projectedDistanceToSegmentDataSquared(
        point: Coordinate,
        segmentData: SegmentData,
        viewProjection: ProjectionLike,
        viewExtent: Extent
    ): number {
        const coordinate = fromUserCoordinate(point, viewProjection)
        const index = segmentData.index ?? 0
        const segments =
            this.subsegmentsFunction?.(segmentData.feature, index, viewExtent) ??
            [segmentData.segment]
        if (!segments.length) {
            return Infinity
        }
        return segments
            .map((segment) => {
                const tempSegment: Segment = [
                    fromUserCoordinate(segment[0], viewProjection),
                    fromUserCoordinate(segment[1], viewProjection),
                ]
                return squaredDistanceToSegment(coordinate, tempSegment)
            })
            .reduce((prev, curr) => Math.min(prev, curr))
    }

    closestOnSegmentData(
        point: Coordinate,
        segmentData: SegmentData,
        viewProjection: ProjectionLike,
        viewExtent?: Extent
    ): Coordinate | undefined {
        const coordinate = fromUserCoordinate(point, viewProjection)
        const index = segmentData.index ?? 0
        const segments =
            this.subsegmentsFunction?.(segmentData.feature, index, viewExtent!) ??
            [segmentData.segment]
        if (!segments.length) {
            return undefined
        }
        const closestIndex = segments
            .map((segment, i) => {
                const tempSegment: Segment = [
                    fromUserCoordinate(segment[0], viewProjection),
                    fromUserCoordinate(segment[1], viewProjection),
                ]
                return [squaredDistanceToSegment(coordinate, tempSegment), i] as const
            })
            .reduce((previous, current) => (previous[0] < current[0] ? previous : current))[1]
        const closestSegment = segments[closestIndex]
        const tempSegment: Segment = [
            fromUserCoordinate(closestSegment![0], viewProjection),
            fromUserCoordinate(closestSegment![1], viewProjection),
        ]
        return toUserCoordinate(closestOnSegment(coordinate, tempSegment), viewProjection)
    }
}