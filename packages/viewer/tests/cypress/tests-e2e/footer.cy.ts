/// <reference types="cypress" />

import { WEBMERCATOR } from '@swissgeo/coordinates'

import { UIModes } from '@/store/modules/ui.store'

interface LayerConfig {
    // common properties
    opacity: number
    type: string

    background: boolean
    searchable: boolean
    tooltip: boolean
    timeEnabled: boolean
    highlightable: boolean
    chargeable: boolean
    hasLegend: boolean

    attribution: string
    attributionUrl?: string

    config3d?: string

    topics: string

    label: string
    serverLayerName: string

    timestamps?: string[]
    timeBehaviour?: string

    // WMS specific properties
    singleTile?: boolean
    wmsUrl?: string
    wmsLayers?: string
    gutter?: number

    // Common to WMTS and WMS
    format?: 'jpeg' | 'png'

    queryableAttributes?: string[]
    resolutions?: number[]

    // GeoJSON specific properties
    geojsonUrl?: string
    styleUrl?: string
    updateDelay?: number

    // Aggregate specific properties
    subLayersIds?: string[]
    minResolution?: number
    maxResolution?: number
}


describe('Testing the footer content / tools', () => {
    it('shows/hide the scale line depending on the map resolution, while in Mercator', () => {
        cy.viewport(1920, 1080)
        cy.goToMapView({ queryParams: { sr: WEBMERCATOR.epsgNumber } })

        // Scale line not visible on standard startup, as the standard zoom level is 7,
        // which means a higher resolution than the acceptable threshold for the scale line to be visible
        cy.get('[data-cy="scaleline"]').should('not.be.visible')

        // triple zoom, the scale line should appear (zoom level 10)
        cy.get('[data-cy="zoom-in"]').click()
        cy.get('[data-cy="zoom-in"]').click()
        cy.get('[data-cy="zoom-in"]').click()
        cy.get('[data-cy="scaleline"]').should('be.visible')

        // it should disappear again if we zoom out again
        cy.get('[data-cy="zoom-out"]').click()
        cy.get('[data-cy="zoom-out"]').click()
        cy.get('[data-cy="zoom-out"]').click()
        cy.get('[data-cy="scaleline"]').should('not.be.visible')
    })

    it('has a functional background wheel', () => {
        function testBackgroundWheel(desktop: boolean = false): void {
            const wheelButton = desktop ? 'background-selector-open-wheel-button-squared' : 'background-selector-open-wheel-button'
            // first, checking that the current bgLayer is the void layer
            cy.readStoreValue('getters.currentBackgroundLayer').should('be.null')

            // opening the background wheel
            cy.get(`[data-cy="${wheelButton}"]`).click()

            // checking that all layers flagged as backgrounds are represented in the wheel
            cy.fixture('layers.fixture').then((layers: Record<string, LayerConfig>) => {
                Object.values(layers)
                    .filter((layer) => layer.background)
                    .forEach((bgLayer) => {
                        cy.get(`[data-cy="background-selector-${bgLayer.serverLayerName}"]`).click()
                        // checking that clicking on the wheel buttons changes the bgLayer of the app accordingly
                        cy.waitUntilState(
                            (state) =>
                                state.layers.currentBackgroundLayerId === bgLayer.serverLayerName
                        )
                        // reopening the BG wheel
                        cy.get(`[data-cy="${wheelButton}"]`).click()
                    })
            })

            // reverting to void layer
            cy.get('[data-cy="background-selector-void"]').click()
            cy.readStoreValue('getters.currentBackgroundLayer').should('be.null')
        }

        cy.goToMapView({ queryParams: { bgLayer: 'void' } })
        // checking the rounded background wheel (mobile/tablet only)
        cy.viewport('iphone-se2')
        testBackgroundWheel()
        // checking that the squared background wheel (desktop) has the same functionalities
        cy.viewport('macbook-11')
        cy.waitUntilState((state) => state.ui.mode === UIModes.DESKTOP)
        testBackgroundWheel(true)
    })
})