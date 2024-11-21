/**
 * List of available styles to be applied to KMLs features.
 *
 * For the time being, this can be either the default style (meaning what Google Earth does) or our
 * custom-made Geoadmin style (everything red)
 *
 * @enum
 */
const KmlStyles = {
    DEFAULT: 'DEFAULT',
    GEOADMIN: 'GEOADMIN',
}

export const allKmlStyles = [KmlStyles.DEFAULT, KmlStyles.GEOADMIN]

export default KmlStyles
