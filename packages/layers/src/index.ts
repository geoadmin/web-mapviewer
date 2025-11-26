import { registerProj4 } from '@swissgeo/coordinates'
import proj4 from 'proj4'

// let's export the types "globally"
export * from '@/types/layers'
export * from '@/types/capabilities'
export * from '@/types/timeConfig'

export * from '@/validation'
import { register } from 'ol/proj/proj4'

registerProj4(proj4)
register(proj4)
