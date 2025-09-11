import proj4 from 'proj4'
import { beforeAll } from 'vitest'

import registerProj4 from '@/registerProj4'

beforeAll(() => {
    registerProj4(proj4)
})
