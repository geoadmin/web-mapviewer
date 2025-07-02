declare global {
    interface Window {
        /**
         * Global variable required for Cesium and point to the URL where four static directories
         * (see vite.config) are served
         *
         * @see https://cesium.com/learn/cesiumjs-learn/cesiumjs-quickstart/#install-with-npm
         */
        CESIUM_BASE_URL: sting
    }
}
