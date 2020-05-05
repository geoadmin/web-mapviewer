<template>
    <div id="ol-map"></div>
</template>

<style>
    #ol-map {
        width: 100%;
        height: 100%;
    }
</style>

<script>
    import 'ol/ol.css';

    import proj4 from "proj4";

    import {mapState, mapGetters, mapActions} from "vuex";
    import {Map, View} from 'ol';
    import {toLonLat} from 'ol/proj';
    import TileLayer from "ol/layer/Tile";
    import XYZ from "ol/source/XYZ";

    proj4.defs(
        "EPSG:3857",
        "+proj=merc +a=6378137 +b=6378137 +lat_ts=0.0 +lon_0=0.0 +x_0=0.0 +y_0=0 +k=1.0 +units=m +nadgrids=@null +wktext  +no_defs"
    );

    const BACKGROUND_LAYER_ID = "ch.swisstopo.pixelkarte-farbe";

    export default {
        computed: {
            ...mapState({
                latitude: state => state.position.latitude,
                longitude: state => state.position.longitude,
                zoom: state => state.position.zoom
            }),
            ...mapGetters(["center", "visibleLayers", "drawGeoJSON"]),
            centerEpsg3857: function () {
                return proj4(proj4.WGS84, proj4("EPSG:3857"), this.center);
            },
            layers: function () {
                let layers = [];
                // background layer
                layers.push(new TileLayer({
                    id: BACKGROUND_LAYER_ID,
                    source: new XYZ({
                        projection: 'EPSG:3857',
                        url: `https://wmts5.geo.admin.ch/1.0.0/${BACKGROUND_LAYER_ID}/default/current/3857/{z}/{x}/{y}.jpeg`
                    })
                }));
                return layers;
            }
        },
        watch: {
            zoom: function (val) {
                this.view.animate({
                    zoom: val,
                    duration: 200
                });
            },
            centerEpsg3857: function (val) {
                this.view.animate({
                    center: val,
                    duration: 500
                })
            }
        },
        mounted() {
            this.view = new View({
                center: this.centerEpsg3857,
                zoom: this.zoom
            });
            this.map = new Map({
                target: 'ol-map',
                layers: this.layers,
                view: this.view,
                controls: []
            });
            this.map.on('moveend', () => {
                if (this.view) {
                    const [longitude, latitude] = toLonLat(this.view.getCenter());
                    if (latitude !== this.latitude || longitude !== this.longitude) {
                        this.setCenter({
                            latitude: latitude,
                            longitude: longitude
                        });
                    }
                    const zoom = this.view.getZoom();
                    if (zoom !== this.zoom) {
                        this.setZoom(zoom);
                    }
                }
            })
        },
        beforeDestroy() {
            this.map = null;
            this.view = null;
        },
        methods: {
            ...mapActions(["setCenter", "setZoom", "click"])
        },
        data: () => {
            return {
                map: null,
                view: null,
                controls: {
                    attribution: true,
                    rotate: false,
                    zoom: false,
                }
            }
        }
    };
</script>
