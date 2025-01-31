import { registerProj4 } from 'geoadmin/proj'
import proj4 from 'proj4'
import { beforeAll } from 'vitest'

beforeAll(() => {
    registerProj4(proj4)
})
