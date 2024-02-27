import { BREAKPOINT_TABLET } from '@/config'

export function isMobile() {
    return Cypress.config('viewportWidth') < BREAKPOINT_TABLET
}
