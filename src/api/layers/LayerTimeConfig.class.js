/**
 * @class
 * @name layers:LayerTimeConfig Time configuration for a {@link WMTSLayer} or {@link WMSLayer}. It will
 *   determine which "timestamp" to add to the URL used to request tiles/image.
 */
export default class LayerTimeConfig {
    /**
     * @param {String} behaviour How the default time series is chosen
     * @param {String[]} series List of series identifier (that can be placed in the WMTS URL)
     */
    constructor(behaviour = null, series = []) {
        this.behaviour = behaviour
        this.series = [...series]
        // first let's tackle layers that have "last" as a timestamp (can be both WMS and WMTS layers)
        // we will return, well, the last timestamp of the series (if there are some)
        if (this.behaviour === 'last' && this.series.length > 0) {
            this.currentTimestamp = this.series[0]
        } else if (this.behaviour) {
            // otherwise if it is a layer that has a specific behaviour (could be "all" for WMS, or a specific timestamp for either type)
            this.currentTimestamp = this.behaviour
        } else if (this.series.length > 0) {
            // if nothing has been defined in the behaviour, but there are some timestamps defined, we take the first
            this.currentTimestamp = this.series[0]
        } else {
            // if no behaviour and no timestamp are defined, we go for "current". This should not happen with WMS layer,
            // as the "current" timestamp in not supported for them but they should always define a behaviour in
            // the BOD configuration, so this is for WMTS layer without time configuration
            this.currentTimestamp = 'current'
        }
    }
}
