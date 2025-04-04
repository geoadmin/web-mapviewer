import { registerProj4 } from '@geoadmin/coordinates'
import { register } from 'ol/proj/proj4'
import proj4 from 'proj4'

export * from '@/layers'
export * from '@/validation'
// todo make these namespace exports maybe
export * from '@/externalWMTSCapabilitiesParser'
export * from '@/externalWMSCapabilitiesParser'
export * from '@/timeConfig'
export * as timeConfigUtils from '@/timeConfigUtils'
export * as layerUtils from '@/layerUtils'

registerProj4(proj4)
// register any custom projection in OpenLayers
register(proj4)
