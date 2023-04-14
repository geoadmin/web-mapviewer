/**
 * @class
 * @name layers:LayerTimeConfig Time configuration for a {@link GeoAdminWMTSLayer} or {@link GeoAdminWMSLayer}. It will
 *   determine which "timestamp" to add to the URL used to request tiles/image.
 */
export default class LayerTimeConfig {
    /**
     * @param {String} behaviour How the default time series is chosen
     * @param {LayerTimeConfigTimestamp[]} timestamps List of series identifier (that can be placed
     *   in the WMTS URL)
     */
    constructor(behaviour = null, timestamps = []) {
        this.behaviour = behaviour
        /** @type {LayerTimeConfigTimestamp[]} */
        this.timestamps = [...timestamps]
        // Here we will define what is the first "currentTimestamp" for this configuration
        // We will simplify the two approaches that exists for WMS and WMTS.
        // The first value will depend on what is in 'behaviour'
        //
        // With WMS the behaviour can be :
        //  - 'last' : the most recent year has to be picked
        //  - 'all' : all years must be picked (so no year should be specified in the URL)
        //  - any valid year that is in 'series'
        //
        // With WMTS the behaviour can be :
        //  - 'current' : 'current' is a valid timestamp in regard to WMTS norm so we can keep it as is and it will be added to URLs
        //  - 'last' : same as WMS, we pick the most recent timestamp from 'series'
        //  - any valid year that is in 'series'
        //  - nothing : we then have to pick the first timestamp of the series as default (same as if it was 'last')
        //
        // first let's tackle layers that have "last" as a timestamp (can be both WMS and WMTS layers)
        // we will return, well, the last timestamp (the most recent) of the series (if there are some)
        if (this.behaviour === 'last' && this.timestamps.length > 0) {
            this.currentTimestamp = this.timestamps[0].timestamp
        } else if (this.behaviour) {
            // otherwise if it is a layer that has a specific behaviour (could be "all" for WMS, or a specific timestamp for either type)
            this.currentTimestamp = this.behaviour
        } else if (this.timestamps.length > 0) {
            // if nothing has been defined in the behaviour, but there are some timestamps defined, we take the first
            this.currentTimestamp = this.timestamps[0].timestamp
        } else {
            // if no behaviour and no timestamp are defined, we go for "current". This should not happen with WMS layer,
            // as the "current" timestamp in not supported for them but they should always define a behaviour in
            // the layer configuration (coming from the backend), so this is for WMTS layer without time configuration
            this.currentTimestamp = 'current'
        }
    }

    /**
     * @param {String} value A complete timestamp value (one that is used to request tiles to the
     *   backend)
     * @returns {Boolean} True if this value was found in this time config, false otherwise
     */
    hasTimestamp(value) {
        return !!this.timestamps.find((timestamp) => timestamp.timestamp === value)
    }

    get years() {
        return this.timestamps.map((timestamp) => timestamp.year).filter((year) => year !== 9999)
    }

    get currentYear() {
        if (!Number.isInteger(parseInt(this.currentTimestamp))) {
            return null
        }
        let currentYear
        if (this.currentTimestamp.length === 4) {
            currentYear = parseInt(this.currentTimestamp)
        } else {
            currentYear = parseInt(this.currentTimestamp.substring(0, 4))
        }
        return currentYear
    }

    /**
     * @param {Number} year
     * @returns {LayerTimeConfigTimestamp}
     */
    getTimestampForYear(year) {
        return this.timestamps.find((timestamp) => timestamp.year === year)
    }

    clone() {
        return Object.assign(Object.create(Object.getPrototypeOf(this)), this)
    }
}
