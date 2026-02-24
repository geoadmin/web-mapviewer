type ViewName = string

/** List of all views that display the map and that should contain the minimal map functionality */
export const MAP_VIEW: ViewName = 'MapView'
export const EMBED_VIEW: ViewName = 'EmbedView'
export const PRINT_VIEW: ViewName = 'PrintView'
export const MAP_VIEWS: ViewName[] = [MAP_VIEW, EMBED_VIEW, PRINT_VIEW]

/** Legacy URL views used for startup */
export const LEGACY_PARAM_VIEW: ViewName = 'LegacyParamsView'
export const LEGACY_EMBED_PARAM_VIEW: ViewName = 'LegacyEmbedParamsView'
export const LEGACY_VIEWS: ViewName[] = [LEGACY_PARAM_VIEW, LEGACY_EMBED_PARAM_VIEW]
