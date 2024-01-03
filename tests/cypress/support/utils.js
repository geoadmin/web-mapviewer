import { BREAKPOINT_TABLET } from '@/config'

export function isMobile() {
    if (Cypress.config('viewportWidth') < BREAKPOINT_TABLET) {
        return true
    }
    return false
}
