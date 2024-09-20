import type { MapGeoJSONFeature, QueryRenderedFeaturesOptions } from 'maplibre-gl'
import type { FrameState } from 'ol/Map.js'
import { toDegrees } from 'ol/math.js'
import { toLonLat } from 'ol/proj.js'
import LayerRenderer from 'ol/renderer/Layer.js'
import GeoJSON from 'ol/format/GeoJSON.js'
import type { Coordinate } from 'ol/coordinate.js'
import type { FeatureCallback } from 'ol/renderer/vector.js'
import type { Feature } from 'ol'
import type { Geometry } from 'ol/geom.js'
import { SimpleGeometry } from 'ol/geom.js'
import type { Pixel } from 'ol/pixel.js'
import type MapLibreLayer from './MapLibreLayer.js'

const VECTOR_TILE_FEATURE_PROPERTY = 'vectorTileFeature';

const formats: {
    [key: string]: GeoJSON;
} = {
    'EPSG:3857': new GeoJSON({
        featureProjection: 'EPSG:3857',
    }),
};

/**
 * This class is a renderer for MapLibre Layer to be able to use the native ol
 * functionalities like map.getFeaturesAtPixel or map.hasFeatureAtPixel.
 */
export default class MapLibreLayerRenderer extends LayerRenderer<MapLibreLayer> {
    private readonly translateZoom: Function | undefined

    constructor(layer: MapLibreLayer, translateZoom: Function | undefined) {
        super(layer)
        this.translateZoom = translateZoom
    }

    getFeaturesAtCoordinate(
        coordinate: Coordinate | undefined,
        hitTolerance: number = 5
    ): Feature<Geometry>[] {
        const pixels = this.getMapLibrePixels(coordinate, hitTolerance);

        if (!pixels) {
            return [];
        }

        const queryRenderedFeaturesOptions =
            (this.getLayer().get(
                'queryRenderedFeaturesOptions',
            ) as QueryRenderedFeaturesOptions) || {};

        // At this point we get GeoJSON MapLibre feature, we transform it to an OpenLayers
        // feature to be consistent with other layers.
        const features = this.getLayer()
            .mapLibreMap?.queryRenderedFeatures(pixels, queryRenderedFeaturesOptions)
            .map((feature) => {
                return this.toOlFeature(feature);
            });

        return features || [];
    }

    override prepareFrame(): boolean {
        return true;
    }

    override renderFrame(frameState: FrameState): HTMLElement | null {
        const layer = this.getLayer();
        const {mapLibreMap} = layer;
        const map = layer.getMapInternal();
        if (!layer || !map || !mapLibreMap) {
            return null;
        }

        const mapLibreCanvas = mapLibreMap.getCanvas();
        const {viewState} = frameState;
        // adjust view parameters in MapLibre
        mapLibreMap.jumpTo({
            center: toLonLat(viewState.center, viewState.projection) as [number, number],
            zoom: (this.translateZoom ? this.translateZoom(viewState.zoom) : viewState.zoom) - 1 ,
            bearing: toDegrees(-viewState.rotation),
        });

        const opacity = layer.getOpacity().toString();
        if (mapLibreCanvas && opacity !== mapLibreCanvas.style.opacity) {
            mapLibreCanvas.style.opacity = opacity;
        }

        if (!mapLibreCanvas.isConnected) {
            // The canvas is not connected to the DOM, request a map rendering at the next animation frame
            // to set the canvas size.
            map.render();
        } else if (!sameSize(mapLibreCanvas, frameState)) {
            mapLibreMap.resize();
        }

        mapLibreMap.redraw();

        return mapLibreMap.getContainer();
    }

    override getFeatures(pixel: Pixel): Promise<Feature<Geometry>[]> {
        const coordinate = this.getLayer()
            .getMapInternal()
            ?.getCoordinateFromPixel(pixel);
        return Promise.resolve(this.getFeaturesAtCoordinate(coordinate));
    }

    override forEachFeatureAtCoordinate<Feature>(
        coordinate: Coordinate,
        _frameState: FrameState,
        hitTolerance: number,
        callback: FeatureCallback<Feature>,
    ): Feature | undefined {
        const features = this.getFeaturesAtCoordinate(coordinate, hitTolerance);
        features.forEach((feature) => {
            const geometry = feature.getGeometry();
            if (geometry instanceof SimpleGeometry) {
                callback(feature, this.getLayer(), geometry);
            }
        });
        return features?.[0] as Feature;
    }

    private getMapLibrePixels(
        coordinate?: Coordinate,
        hitTolerance?: number,
    ): [[number, number], [number, number]] | [number, number] | undefined {
        if (!coordinate) {
            return undefined;
        }

        const pixel = this.getLayer().mapLibreMap?.project(
            toLonLat(coordinate) as [number, number],
        );

        if (pixel?.x === undefined || pixel?.y === undefined) {
            return undefined;
        }

        let pixels: [[number, number], [number, number]] | [number, number] = [
            pixel.x,
            pixel.y,
        ];

        if (hitTolerance) {
            const [x, y] = pixels as [number, number];
            pixels = [
                [x - hitTolerance, y - hitTolerance],
                [x + hitTolerance, y + hitTolerance],
            ];
        }
        return pixels;
    }

    private toOlFeature(feature: MapGeoJSONFeature): Feature<Geometry> {
        const layer = this.getLayer();
        const map = layer.getMapInternal();

        const projection =
            map?.getView()?.getProjection()?.getCode() || 'EPSG:3857';

        if (!formats[projection]) {
            formats[projection] = new GeoJSON({
                featureProjection: projection,
            });
        }

        const olFeature = formats[projection].readFeature(feature) as Feature;
        if (olFeature) {
            // We save the original MapLibre feature to avoid losing information
            // potentially needed for others functionalities like highlighting
            // (id, layer id, source, sourceLayer ...)
            olFeature.set(VECTOR_TILE_FEATURE_PROPERTY, feature, true);
        }
        return olFeature;
    }
}

function sameSize(canvas: HTMLCanvasElement, frameState: FrameState): boolean {
    return (
        canvas.width === Math.floor(frameState.size[0] * frameState.pixelRatio) &&
        canvas.height === Math.floor(frameState.size[1] * frameState.pixelRatio)
    );
}
