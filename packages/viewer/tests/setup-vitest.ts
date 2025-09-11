import { registerProj4 } from '@swissgeo/coordinates'
import proj4 from 'proj4'
import { beforeAll } from 'vitest'

beforeAll(() => {
    registerProj4(proj4)
})
