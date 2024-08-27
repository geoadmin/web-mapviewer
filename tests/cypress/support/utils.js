import { BREAKPOINT_TABLET } from '@/config/responsive.config'

export function isMobile() {
    return Cypress.config('viewportWidth') < BREAKPOINT_TABLET
}
