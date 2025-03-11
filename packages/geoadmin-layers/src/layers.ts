import type { ErrorMessage } from "@/validation"

export enum LayerType {
    WMTS = 'WMTS',
    WMS = 'WMS',
    GEOJSON = 'GEOJSON',
    AGGREGATE = 'AGGREGATE',
    KML = 'KML',
    GPX = 'GPX',
    VECTOR = 'VECTOR',
    GROUP = 'GROUP',
    COG = 'COG',
}

export interface LayerAttribution {
  name: string
  url: string
}

/**
 * @interface Layer
 */
export interface Layer {
  /** Name of this layer in the current lang */
  name: string
  /** The unique ID of this layer that will be used in the URL to
   * identify it (and also in subsequent backend services for GeoAdmin layers) */
  readonly id: string
  /** The layer type  */
  readonly type: LayerType,
  /** What's the backend base URL to use when requesting
   * tiles/image for this layer, will be used to construct the URL of this layer later on */
  readonly baseUrl?: string /* can be left out because some don't have that? */
  /** Flag telling if the base URL must always have a trailing slash. It might be sometime the case
   * that this is unwanted (i.e. for an external WMS URL already built past the point of URL params,
   * a trailing slash would render this URL invalid). Default is `false` */
  // TODO this is actually only used in the constructor but not saved to the object!
  // readonly ensureTrailingSlashInBaseUrl: boolean
  /** Value from 0.0 to 1.0 telling with which opacity this
   * layer should be shown on the map. */
  opacity: number
  /** If the layer should be visible on the map or
        hidden. */
  visible: boolean /* TODO propose to rename this to isVisible */
  /** Description of the data owner(s) for this layer. */
  readonly attributions: LayerAttribution[]
  /** Define if this layer shows tooltip when clicked on. */
  readonly hasTooltip: boolean
  /** Define if this layer has a description that can be shown to users to explain its content. */
  hasDescription: boolean
  /** Define if this layer has a legend that can be shown to users to explain its content. */
  readonly hasLegend: boolean
  /** Define if this layer comes from our backend, or is from another (external) source. */
  readonly isExternal: boolean
  /** Set to true if some parts of the layer (e.g. metadata) are still loading */
  isLoading: boolean
  /** Time series config */
  /* TODO migrate the layer time config */
  readonly timeConfig?: any
  /** The custom attributes (except the well known updateDelays, adminId, features and year)
   * passed with the layer id in url. */
  readonly customAttributes?: Record<string, string>

  // new fields that weren't specified in AbstractLayer's Constructor
  errorMessages?: Set<ErrorMessage>
  hasError: boolean
  hasMultipleTimestamps: boolean
}



/* #region: GeoAdminLayers */

/**
 * This interface unifies the shared properties of the layers that
 * speak to an API like WMS and WMTS
 *
 * @interface GeoAdminAPILayer
 */
export interface GeoAdminAPILayer extends Layer {
  /** Tells if this layer possess features that should be highlighted on the map after a click
   *  (and if the backend will provide valuable  information on the
   * {@link http://api3.geo.admin.ch/services/sdiservices.html#identify-features} endpoint). */
  isHighlightable: boolean
  /** All the topics in which belongs this layer. */
  topics: any[] /* TODO type for this? */
  /** Define if this layer's features can be searched through the search bar. */
  searchable: boolean // TODO shareable?
  /** In which image format the backend must be requested. */
  format: 'png' | 'jpeg'
  /** The ID/name to use when requesting the WMS backend, this might be different than id, and many
   * layers (with different id) can in fact request the same layer, through the same technical name,
   * in the end) */
  technicalName: string
  /** The layer ID to be used as substitute for this layer
   * when we are showing the 3D map. Will be using the same layer if this is set to null. */
  idIn3d?: string
  isSpecificFor3d: boolean /* TODO maybe the wrong place for this */
  /* oh OK this is determined by the _3d suffix. Why then isn't it made a 3d layer? */
}

/**
 * Represent a WMS Layer from geo.admin.ch
 *
 * @interface GeoAdminWmsLayer
 */
export interface GeoAdminWMSLayer extends GeoAdminAPILayer {
  isExternal: false,
  /** How much of a gutter (extra pixels around the image) we want. This is specific for tiled WMS,
   * if unset this layer will be a considered a single tile WMS. */
  gutter: number
  /** Version of the WMS protocol to use while requesting images on this layer. */
  wmsVersion: string
  /** The lang ISO code to use when requesting the backend (WMS images can have text that are
   * language dependent). */
  lang: string // TODO sharable?

  type: LayerType.WMS
}

/**
 * Represent a WMTS layer from geo.admin.ch
 *
 * @interface GeoAdminWMTSLayer
 */
export interface GeoAdminWMTSLayer extends GeoAdminAPILayer {
  /** If this layer should be treated as a background layer. */
  isBackground: boolean
  /** Define the maximum resolution the layer can reach */
  maxResolution: number
  type: LayerType.WMTS
}

export interface GeoAdmin3DLayer extends Layer { }

export interface GeoAdminGeoJSONLayer extends Layer {
  type: LayerType.GEOJSON
  updateDelay: number
  styleUrl: string
  geoJsonUrl: string
  // TODO these are set in the class to null
  geoJsonStyle: any
  geoJsonData: any
}

export interface GeoAdminVectorLayer extends Layer {

}

/* #endregion */

/* #region: File Type Layers */
export interface CloudOptimizedTiffLayer extends Layer {

}

export interface KMLLayer extends Layer {

}

export interface GPXLayer extends Layer {

}
/* #endregion */


/* #region: external layers */
export interface ExternalWMTSLayer extends Layer {

}

export interface ExternalWMSLayer extends Layer {

}


/* #endregion */

type FileLayer = KMLLayer | GPXLayer | CloudOptimizedTiffLayer;
type ExternalLayer = ExternalWMSLayer | ExternalWMTSLayer;
type GeoAdminLayer = GeoAdminWMTSLayer | GeoAdminWMSLayer | GeoAdminGeoJSONLayer | GeoAdmin3DLayer | GeoAdminVectorLayer;
