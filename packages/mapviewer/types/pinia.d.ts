import type Router from 'vue-router'

import 'pinia'

declare module 'pinia' {
    export interface PiniaCustomProperties {
        router: Router
    }
}
