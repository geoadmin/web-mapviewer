import { registerProj4 } from '@geoadmin/coordinates'
import { register } from 'ol/proj/proj4'
import proj4 from 'proj4'

export * from './ExternalWMSCapabilitiesParser.ts'
export * from './ExternalWMTSCapabilitiesParser.ts'

registerProj4(proj4)
// register any custom projection in OpenLayers
register(proj4)
