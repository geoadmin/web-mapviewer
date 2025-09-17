import { BREAKPOINT_TABLET } from '@/config/responsive.config'

export function isMobile(): boolean {
    return Cypress.config('viewportWidth') < BREAKPOINT_TABLET
}

export function assertDefined<T>(value: T | undefined | null): asserts value is NonNullable<T> {
    if (value === undefined || value === null) {
        throw new Error(`Expected value to be defined, but got: ${value}`)
    }
}