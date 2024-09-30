import type { MapOptions, QueryRenderedFeaturesOptions } from 'maplibre-gl'
import { Map as MapLibreMap } from 'maplibre-gl'
import type { Map } from 'ol'
import type { Options as LayerOptions } from 'ol/layer/Layer.js'
import Layer from 'ol/layer/Layer.js'
import type { EventsKey } from 'ol/events.js'
import BaseEvent from 'ol/events/Event.js'
import { unByKey } from 'ol/Observable.js'
import { Source } from 'ol/source.js'
import MapLibreLayerRenderer from './MapLibreLayerRenderer.js'
import getMapLibreAttributions from './getMapLibreAttributions.js'

export type MapLibreOptions = Omit<MapOptions, 'container'>;

export type MapLibreLayerOptions = LayerOptions & {
    mapLibreOptions: MapLibreOptions;
    queryRenderedFeaturesOptions?: QueryRenderedFeaturesOptions;
    translateZoom?: Function
};

export default class MapLibreLayer extends Layer {
    mapLibreMap?: MapLibreMap;

    loaded: boolean = false;

    private olListenersKeys: EventsKey[] = [];

    constructor(options: MapLibreLayerOptions) {
        super({
            source: new Source({
                attributions: () => {
                    return getMapLibreAttributions(this.mapLibreMap);
                },
            }),
            ...options,
        });
    }

    override disposeInternal() {
        unByKey(this.olListenersKeys);
        this.loaded = false;
        if (this.mapLibreMap) {
            // Some asynchronous repaints are triggered even if the MapLibreMap has been removed,
            // to avoid display of errors we set an empty function.
            this.mapLibreMap.triggerRepaint = () => {};
            this.mapLibreMap.remove();
        }
        super.disposeInternal();
    }

    override setMapInternal(map: Map) {
        super.setMapInternal(map);
        if (map) {
            this.loadMapLibreMap();
        } else {
            // TODO: I'm not sure if it's the right call
            this.dispose();
        }
    }

    private loadMapLibreMap() {
        this.loaded = false;
        const map = this.getMapInternal();
        if (map) {
            this.olListenersKeys.push(
                map.on('change:target', this.loadMapLibreMap.bind(this)),
            );
        }

        if (!map?.getTargetElement()) {
            return;
        }

        if (!this.getVisible()) {
            // On next change of visibility we load the map
            this.olListenersKeys.push(
                this.once('change:visible', this.loadMapLibreMap.bind(this)),
            );
            return;
        }

        const container = document.createElement('div');
        container.style.position = 'absolute';
        container.style.width = '100%';
        container.style.height = '100%';

        const mapLibreOptions = this.get('mapLibreOptions') as MapLibreOptions;

        this.mapLibreMap = new MapLibreMap(
            Object.assign({}, mapLibreOptions, {
                container: container,
                attributionControl: false,
                interactive: false,
                trackResize: false,
            }),
        );

        this.mapLibreMap.on('sourcedata', () => {
            this.getSource()?.refresh(); // Refresh attribution
        });

        this.mapLibreMap.once('load', () => {
            this.loaded = true;
            this.dispatchEvent(new BaseEvent('load'));
        });
    }

    override createRenderer(): MapLibreLayerRenderer {
        const translateZoom = this.get('translateZoom') as Function | undefined;
        return new MapLibreLayerRenderer(this, translateZoom);
    }
}
