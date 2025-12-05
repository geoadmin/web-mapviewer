import { Interval } from 'luxon';
import { Layer, LayerTimeConfig, LayerTimeConfigEntry } from '../types';
export declare const hasTimestamp: (timeConfig: LayerTimeConfig, timestamp: string) => boolean;
export declare const getTimeEntryForYear: (timeConfig: LayerTimeConfig, year: number) => LayerTimeConfigEntry | undefined;
export declare const updateCurrentTimeEntry: (timeConfig: LayerTimeConfig, entryOrTimestamp: LayerTimeConfigEntry | string | undefined) => void;
export declare const makeTimeConfigEntry: (timestamp: string) => LayerTimeConfigEntry;
export declare const makeTimeConfig: (behaviour?: string, timeEntries?: LayerTimeConfigEntry[]) => LayerTimeConfig | undefined;
export declare const hasMultipleTimestamps: (layer: Layer) => boolean;
export declare function getYearFromLayerTimeEntry(timeEntry: LayerTimeConfigEntry): number | undefined;
export declare const getTimeEntryForInterval: (layer: Layer, interval: Interval) => LayerTimeConfigEntry | undefined;
/** Returns timestamp for WMS or WMTS layer from config data */
export declare function getTimestampFromConfig(layer: Layer): string | undefined;
export interface GeoadminTimeConfigUtils {
    hasTimestamp: typeof hasTimestamp;
    getTimeEntryForYear: typeof getTimeEntryForYear;
    updateCurrentTimeEntry: typeof updateCurrentTimeEntry;
    makeTimeConfigEntry: typeof makeTimeConfigEntry;
    makeTimeConfig: typeof makeTimeConfig;
    hasMultipleTimestamps: typeof hasMultipleTimestamps;
    getYearFromLayerTimeEntry: typeof getYearFromLayerTimeEntry;
    getTimeEntryForInterval: typeof getTimeEntryForInterval;
    getTimestampFromConfig: typeof getTimestampFromConfig;
}
export declare const timeConfigUtils: GeoadminTimeConfigUtils;
export default timeConfigUtils;
