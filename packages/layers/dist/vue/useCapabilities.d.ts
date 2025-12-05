import { CoordinateSystem } from '@swissgeo/coordinates';
import { MaybeRefOrGetter } from 'vue';
import { ExternalWMSLayer, ExternalWMTSLayer } from '../types';
export interface ParsedExternalWMS {
    layers: ExternalWMSLayer[];
    wmsMaxSize?: {
        width: number;
        height: number;
    };
}
export interface ParsedExternalWMTS {
    layers: ExternalWMTSLayer[];
}
interface useCapabilitiesExport {
    loadCapabilities: () => Promise<ParsedExternalWMTS | ParsedExternalWMS>;
}
export declare function useCapabilities(url: MaybeRefOrGetter<string>, projection: MaybeRefOrGetter<CoordinateSystem>, lang: MaybeRefOrGetter<string>): useCapabilitiesExport;
export {};
