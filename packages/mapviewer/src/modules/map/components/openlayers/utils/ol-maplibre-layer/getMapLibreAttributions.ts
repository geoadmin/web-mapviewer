import type { Map as MapLibreMap, Source } from 'maplibre-gl'

/**
 * Return the copyright a MapLibre map.
 * @param map A MapLibre map
 */
const getMapLibreAttributions = (map: MapLibreMap | undefined): string[] => {
    if (!map) {
        return [];
    }
    const {style} = map;
    if (!style) {
        return [];
    }
    const {sourceCaches} = style;
    let copyrights: string[] = [];

    Object.values(sourceCaches).forEach(
        (value: {used: boolean; getSource: () => Source}) => {
            if (value.used) {
                const {attribution} = value.getSource();

                if (attribution) {
                    copyrights = copyrights.concat(
                        attribution.replace(/&copy;/g, '©').split(/(<a.*?<\/a>)/),
                    );
                }
            }
        },
    );

    return removeDuplicate(copyrights);
};
/**
 * This function remove duplicates lower case string value of an array.
 * It removes also null, undefined or non string values.
 *
 * @param {array} array Array of values.
 */
export const removeDuplicate = (array: string[]): string[] => {
    const arrWithoutEmptyValues = array.filter(
        (val) => val !== undefined && val !== null && val.trim && val.trim(),
    );
    const lowerCasesValues = arrWithoutEmptyValues.map((str) =>
        str.toLowerCase(),
    );
    // Use of Set removes duplicates
    const uniqueLowerCaseValues = [...new Set(lowerCasesValues)] as string[];
    return uniqueLowerCaseValues.map((uniqueStr) =>
        arrWithoutEmptyValues.find((str) => str.toLowerCase() === uniqueStr),
    ) as string[];
};

export default getMapLibreAttributions;
