<template>
    <vl-map @click="onClick" :default-controls="controls">
        <vl-view
                :zoom="zoom"
                :center="centerEpsg3857"
                @update:center="onCenterChange"
                @update:zoom="onZoomChange"
        ></vl-view>
        <component :is="layer.component" v-for="layer in layers" :key="layer.id">
            <component
                    v-if="layer.source"
                    :is="layer.source.component"
                    :url="layer.source.url"
                    :feature="layer.source.features"
                    :projection="layer.source.projection"
            >
                <vl-style-box>
                    <vl-style-stroke color="blue"></vl-style-stroke>
                    <vl-style-fill color="rgba(255,255,255,0.5)"></vl-style-fill>
                    <vl-style-text text="I'm a circle"></vl-style-text>
                </vl-style-box>
            </component>
        </component>
        <vl-layer-vector>
            <vl-source-vector :features="drawGeoJSON.features" projection="EPSG:4326"></vl-source-vector>
        </vl-layer-vector>
    </vl-map>
</template>

<style>
    /*.ol-zoom {*/
    /*    display: none;*/
    /*}*/
</style>

<script>
    import "vuelayers/lib/style.css";

    import proj4 from "proj4";

    import Vue from "vue";
    import { mapState, mapGetters, mapActions } from "vuex";
    import VueLayers, {
        ImageLayer,
        ImageWmsSource,
        TileLayer,
        XyzSource,
        VectorLayer,
        VectorSource
    } from "vuelayers";
    import GeoJSONFormat from "ol/format/GeoJSON";

    Vue.use(VueLayers);

    proj4.defs(
        "EPSG:3857",
        "+proj=merc +a=6378137 +b=6378137 +lat_ts=0.0 +lon_0=0.0 +x_0=0.0 +y_0=0 +k=1.0 +units=m +nadgrids=@null +wktext  +no_defs"
    );

    const BACKGROUND_LAYER_ID = "ch.swisstopo.pixelkarte-farbe";

    export default {
        component: {
            VueLayers,
            ImageLayer,
            ImageWmsSource,
            TileLayer,
            XyzSource,
            VectorLayer,
            VectorSource
        },
        computed: {
            ...mapState({
                latitude: state => state.position.latitude,
                longitude: state => state.position.longitude,
                zoom: state => state.position.zoom
            }),
            ...mapGetters(["center", "visibleLayers", "drawGeoJSON"]),
            centerEpsg3857: function() {
                return proj4(proj4.WGS84, proj4("EPSG:3857"), this.center);
            },
            layers: function() {
                let layers = [];
                // background layer
                layers.push({
                    id: BACKGROUND_LAYER_ID,
                    component: TileLayer.Layer.name,
                    source: {
                        component: XyzSource.Source.name,
                        url: `https://wmts5.geo.admin.ch/1.0.0/${BACKGROUND_LAYER_ID}/default/current/3857/{z}/{x}/{y}.jpeg`
                    }
                });

                // visible layers
                this.visibleLayers.forEach(layer => {
                    switch (layer.type) {
                        case "WMS":
                            layers.push({
                                id: layer.id,
                                component: ImageLayer.Layer.name,
                                source: {
                                    component: ImageWmsSource.Source.name,
                                    url: `https://wms.geo.admin.ch?LAYERS=${
                                        layer.id
                                    }&FORMAT=image/png&LANG=en`
                                }
                            });
                            break;
                        case "WMTS":
                            layers.push({
                                id: layer.id,
                                component: TileLayer.Layer.name,
                                source: {
                                    component: XyzSource.Source.name,
                                    url: `https://wmts5.geo.admin.ch/1.0.0/${
                                        layer.id
                                    }/default/current/3857/{z}/{x}/{y}.png`
                                }
                            });
                            break;
                        case "GeoJSON":
                            layers.push({
                                id: layer.id,
                                component: VectorLayer.Layer.name,
                                source: {
                                    component: VectorSource.Source.name,
                                    features: new GeoJSONFormat().readFeatures(layer.data),
                                    projection: 'EPSG:4326'
                                }
                            });
                            break;
                        default:
                            console.log(`layer type '${layer.type}' not yet implemented`);
                    }
                });
                return layers;
            }
        },
        methods: {
            ...mapActions(["setCenter", "setZoom", "click"]),
            onCenterChange: function(newCenter) {
                const newCenterWGS84 = proj4("EPSG:3857", proj4.WGS84, newCenter);
                this.setCenter({
                    latitude: newCenterWGS84[1],
                    longitude: newCenterWGS84[0]
                });
            },
            onZoomChange: function(newZoom) {
                this.setZoom(newZoom);
            },
            onClick: function(event) {
                const clickCoordinates = proj4(
                    "EPSG:3857",
                    proj4.WGS84,
                    event.coordinate
                );
                this.click({
                    longitude: clickCoordinates[0],
                    latitude: clickCoordinates[1]
                });
            }
        },
        data: () => {
            return {
                controls: {
                    attribution: true,
                    rotate: false,
                    zoom: false,
                }
            }
        }
    };
</script>
