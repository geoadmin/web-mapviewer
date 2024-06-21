import LayerTimeConfigEntry, { ALL_YEARS_TIMESTAMP } from '@/api/layers/LayerTimeConfigEntry.class'

/**
 * @class
 * @name layers:LayerTimeConfig Time configuration for a {@link GeoAdminWMTSLayer} or {@link GeoAdminWMSLayer}. It will
 *   determine which "timestamp" to add to the URL used to request tiles/image.
 * @WARNING DON'T USE GETTER AND SETTER ! Instances of this class will be used a Vue 3 reactive
 * object which SHOULD BE plain javascript object ! For convenience we use class instances but this
 * has some limitations and javascript class getter and setter are not correctly supported which
 * introduced subtle bugs. As rule of thumb we should avoid any public methods with side effects on
 * properties, properties should change be changed either by the constructor or directly by setting
 * them, not through a functions that updates other properties as it can lead to subtle bugs due
 * to Vue reactivity engine.
 */
export default class LayerTimeConfig {
    /**
     * @param {String} behaviour How the default timestamp is chosen
     * @param {LayerTimeConfigEntry[]} timeEntries List of timestamps identifier (that can be placed
     *   in the WMTS URL)
     */
    constructor(behaviour = null, timeEntries = []) {
        this.behaviour = behaviour
        /** @type {LayerTimeConfigEntry[]} */
        this.timeEntries = [...timeEntries]
        if (this.behaviour === ALL_YEARS_TIMESTAMP) {
            this.timeEntries.splice(0, 0, new LayerTimeConfigEntry(ALL_YEARS_TIMESTAMP))
        }
        /*
         * Here we will define what is the first "currentTimeEntry" for this configuration.
         * We will simplify the two approaches that exists for WMS and WMTS.
         * The first value will depend on what is in 'behaviour'
         *
         * With WMS the behaviour can be :
         *  - 'last' : the most recent year has to be picked
         *  - 'all' : all years must be picked (so the year 9999 or no year should be specified in the URL)
         *  - any valid year that has an equivalent in 'timeEntries'
         *
         * With WMTS the behaviour can be :
         *  - 'current' : 'current' is a valid timestamp in regard to WMTS URL norm so we need to do about the same as
         *                with WMS and keep this information for later use
         *  - 'last' : same as WMS, we pick the most recent timestamp from 'timestamps'
         *  - any valid year that is in 'timestamps'
         *  - nothing : we then have to pick the first timestamp of the timestamps as default (same as if it was 'last')
         *
         * First let's tackle layers that have "last" as a timestamp (can be both WMS and WMTS layers).
         * We will return, well, the last timestamp (the most recent) of the timestamps (if there are some)
         * or if nothing has been defined in the behaviour, but there are some timestamps defined, we take the first.
         */
        this.currentTimeEntry = null
        if ((this.behaviour === 'last' || !this.behaviour) && this.timeEntries.length > 0) {
            this.updateCurrentTimeEntry(this.timeEntries[0])
        } else if (this.behaviour) {
            // otherwise if it is a layer that has a specific behaviour (could be "all" for WMS, or a specific timestamp for either type)
            this.updateCurrentTimeEntry(behaviour)
        }

        this.years = this.timeEntries.map((entry) => entry.year)
    }

    /**
     * Update current time entry
     *
     * This method update the current time entry, current timestamp and current year.
     *
     * - @WARNING USE ONLY THIS METHOD inside a vuex mutation ! This has side effects and could cause
     *   reactivity issue when used outside a vuex mutation context.
     *
     * @param {LayerTimeConfigEntry | string | null} entry Timestamp of the entry to set
     */
    updateCurrentTimeEntry(entry) {
        let currentTimeEntry = null
        if (entry instanceof LayerTimeConfigEntry) {
            currentTimeEntry = entry
        } else if (entry) {
            currentTimeEntry = this.timeEntries.find((e) => e.timestamp === entry) ?? null
        }
        this.currentTimeEntry = currentTimeEntry
        this.currentTimestamp = this.currentTimeEntry?.timestamp ?? null
        this.currentYear = this.currentTimeEntry?.year ?? null
    }

    /**
     * @param {String} timestamp A complete timestamp value (one that is used to request tiles to
     *   the backend)
     * @returns {Boolean} True if this value was found in this time config, false otherwise
     */
    hasTimestamp(timestamp) {
        return !!this.timeEntries.find((entry) => entry.timestamp === timestamp)
    }

    /**
     * @param {Number} year
     * @returns {LayerTimeConfigEntry | null}
     */
    getTimeEntryForYear(year) {
        return this.timeEntries.find((entry) => entry.year === year) ?? null
    }

    /**
     * @param {String} timestamp
     * @returns {LayerTimeConfigEntry | null}
     */
    getTimeEntryForTimestamp(timestamp) {
        return this.timeEntries.find((entry) => entry.timestamp === timestamp) ?? null
    }

    clone() {
        return Object.assign(Object.create(Object.getPrototypeOf(this)), this)
    }
}
