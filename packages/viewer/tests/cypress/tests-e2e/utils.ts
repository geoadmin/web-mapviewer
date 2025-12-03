/// <reference types="cypress" />

import type { SingleCoordinate } from '@swissgeo/coordinates'

import useUIStore from '@/store/modules/ui'

export interface MockLayer {
    opacity: number
    wmsLayers: string
    attribution: string
    background: boolean
    searchable: boolean
    format: string
    topics: string
    wmsUrl: string
    tooltip: boolean
    timeEnabled: boolean
    singleTile: boolean
    highlightable: boolean
    chargeable: boolean
    hasLegend: boolean
    label: string
    type: string
    serverLayerName: string
    queryableAttributes?: string[]
    timestamps?: string[]
    timeBehaviour?: string
    resolutions?: number[]
}

export function moveTimeSlider(x: number) {
    cy.get('[data-cy="time-slider-bar-cursor-grab"]').trigger('mousedown', { button: 0 })
    cy.get('[data-cy="time-slider-bar-cursor-grab"]').trigger('mousemove', {
        screenX: Math.abs(x),
        screenY: 0,
    })
    cy.get('[data-cy="time-slider-bar-cursor-grab"]').trigger('mouseup', { force: true })
}

export function getGeolocationButtonAndClickIt() {
    const geolocationButtonSelector = '[data-cy="geolocation-button"]'
    cy.get(geolocationButtonSelector).should('be.visible').click()
}

export function testErrorMessage(message: string) {
    const geolocationButtonSelector = '[data-cy="geolocation-button"]'
    // move the mouse away from the button because the tooltip covers the
    // error message
    cy.get(geolocationButtonSelector).trigger('mousemove', { clientX: 0, clientY: 0, force: true }) // Check error in store

    // Check error in store
    cy.getPinia().then((pinia) => {
        const uiStore = useUIStore(pinia)
        expect(uiStore.errors).to.be.a('Set')
        // Make sure this is the only error (we don't want to test other errors)
        expect(uiStore.errors.size).to.eq(1)

        const error = uiStore.errors.values().next().value
        expect(error).to.be.an('Object')
        expect(error!.msg).to.eq(message)
    })
    // Check error in UI
    cy.get('[data-cy="error-window"]').should('be.visible')
    cy.get('[data-cy="error-window-close"]').should('be.visible').click() // close the error window
}

export function checkPosition(
    position: SingleCoordinate | undefined,
    expectedX: number,
    expectedY: number
) {
    expect(position).to.be.an('Array')
    expect(position!.length).to.eq(2)
    expect(position![0]).to.approximately(expectedX, 0.1)
    expect(position![1]).to.approximately(expectedY, 0.1)
}
