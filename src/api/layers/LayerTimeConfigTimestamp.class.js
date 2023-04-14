/**
 * Old timestamp were covering a full year but were described as a single day of this year.
 *
 * Some timestamps were using the first of january, and others the last day of december. This enum
 * helps decipher which one to use on a time config base.
 *
 * @enum
 */
export const TIMESTAMP_LEGACY_BEHAVIOR = {
    START_OF_YEAR: 'START_OF_YEAR',
    END_OF_YEAR: 'END_OF_YEAR',
}

export class LayerTimeConfigTimestamp {
    /**
     * @param {Number} year The year of this timestamp as YYYYY
     * @param {TIMESTAMP_LEGACY_BEHAVIOR} legacyBehavior How the year should be filled to create the
     *   matching timestamp in our infrastructure. Some layers have the first day of the year as
     *   timestamp while others have the last.
     */
    constructor(year, legacyBehavior = TIMESTAMP_LEGACY_BEHAVIOR.END_OF_YEAR) {
        this.year = year
        this.legacyBehaviour = legacyBehavior
    }

    get timestamp() {
        if (this.legacyBehaviour === TIMESTAMP_LEGACY_BEHAVIOR.START_OF_YEAR) {
            return `${this.year}0101`
        } else {
            return `${this.year}1231`
        }
    }
}
