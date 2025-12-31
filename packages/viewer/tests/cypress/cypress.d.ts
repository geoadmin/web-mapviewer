/* eslint-disable */

import { mount } from 'cypress/vue'
import type { ExternalWMSLayer, ExternalWMTSLayer } from '@swissgeo/layers'
import type { EditableFeatureTypes } from '@swissgeo/api'

import type { GoToViewOptions, PartialLayer } from './support/commands'

type MountParams = Parameters<typeof mount>
type OptionsParam = MountParams[1]
interface MockLayer {
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
declare global {
    namespace Cypress {
        interface Chainable {
            mount: typeof mount
            /** Returns the currently used mocked-up (external) WMS layer configurations. */
            getExternalWmsMockConfig(): Cypress.Chainable<ExternalWMSLayer[]>
            /** Returns the currently used mocked-up (external) WMTS layer configurations. */
            getExternalWmtsMockConfig(): Cypress.Chainable<ExternalWMTSLayer[]>

            /**
             * Command that visits the main view and waits for the map to be shown (for the app to
             * be ready) All parameters are optional. They can either be passed in order or inside a
             * wrapper object.
             */
            goToMapView(options?: GoToViewOptions): void
            /**
             * Command that visits the embed view and waits for the map to be shown (for the app to
             * be ready) All parameters are optional. They can either be passed in order or inside a
             * wrapper object.
             */
            goToEmbedView(options?: GoToViewOptions): void

            /**
             * Wait until the map has been rendered and is ready. This is useful and needed during
             * the application startup phase and also after changing views that might disable click
             * on the map, like for example the drawing mode
             *
             * @param options
             * @param options.timeout Optional timeout in ms. Default to 20000
             * @param options.olMap Optional flag to wait for the OpenLayers map to be ready.
             *   Default to true.
             * @param options.expectPointerReady Optional flag to wait for the map pointer event to be
             *   ready. Default to true.
             */
            waitMapIsReady(options?: {
                timeout?: number
                olMap?: boolean
                expectPointerReady?: boolean
            }): void
            /**
             * Cypress-wait-until wrapper to wait for a specific (Vuex) store state.
             *
             * @param predicate
             * @param options
             */
            waitUntilState(
                predicate: (pinia: Pinia) => boolean,
                options?: { timeout?: number; customMessage?: string; errorMsg?: string }
            ): void

            /**
             * Get a Pinia store by its ID
             *
             * @example
             *     cy.getPiniaStore('position').its('rotation').should('eq', 0)
             *     cy.getPiniaStore('ui').invoke('setFullscreenMode', true)
             *
             * @param storeId - The store ID (e.g., 'position', 'ui', 'app', 'layers')
             * @returns The Pinia store instance
             */
            getPiniaStore(storeId: string): Cypress.Chainable<any>
            getPinia(): Cypress.Chainable<Pinia>

            /**
             * Call a Pinia store action
             *
             * @example
             *     cy.callStoreAction('position.setRotation', [1.57, 'e2e-test'])
             *     cy.callStoreAction('ui.setFullscreenMode', [true, 'e2e-test'])
             *
             * @param key - Path to action: 'storeName.actionName'
             * @param args - Arguments to pass to the action
             */
            callStoreAction(key: string, args?: any[]): Cypress.Chainable<any>

            /**
             * Click on language command
             *
             * This command change the application to the given language independently of the UI
             * mode (mobile/tablet/desktop)
             *
             * @param lang Language to click; `de`, `fr`, `it`, `en` or `rm`
             */
            clickOnLanguage(lang: string): void

            paste(text: string): Cypress.Chainable<JQuery<HTMLElement>>
            readClipboardValue(): Cypress.Chainable<JQuery<string>>

            waitUntilCesiumTilesLoaded(): void

            /**
             * Returns a timestamp from the layer's config that is different from the default
             * behaviour
             *
             * @param layer A layer's metadata, that usually come from the fixture
             *   layers.fixture.json
             * @returns One of the layer's timestamp, different from the default one (not equal to
             *   `timeBehaviour`)
             */
            getRandomTimestampFromSeries(layer: MockLayer): Cypress.Chainable<string | undefined>
            openLayerSettings(layerId: string): void
            /**
             * Check if the layer(s) have been successfully added and rendered on Open Layer Map.
             *
             * It also checks that layers are at the correct zIndex
             *
             * NOTE: remember to add the background layer in the layer list
             *
             * @param args Layer(s) to check
             */
            checkOlLayer(args?: (string | PartialLayer)[]): void

            openMenuIfMobile(): void
            closeMenuIfMobile(): void

            /**
             * Opens the drawing mode. Will open the menu if the app is in mobile mode and the menu
             * is not yet open.
             */
            openDrawingMode(): void

            /**
             * Closes the drawing mode. Will close the "You have not copied the link" message if it
             * is shown.
             *
             * @param closeDrawingNotSharedAdmin Optional flag to close the drawing not shared admin
             *   modal if it is open. Default to true.
             */
            closeDrawingMode(closeDrawingNotSharedAdmin?: boolean): void
            /**
             * Opens up the viewer and goes straight to the drawing module.
             *
             * Param queryParams Optional query parameters to add to the URL.
             *
             * @param withHash Optional flag to set if legacy (withHash=false) or new
             *   (withHash=true) URL should be used.
             */
            goToDrawing(queryParams?: Record<string, string>, withHash?: boolean): void
            /**
             * Helper function to select a drawing tool.
             *
             * @param tool The ID of the tool to activate, see {@link EditableFeatureTypes}
             * @param unselect Optional flag to unselect the current tool. Default to false.
             */
            clickDrawingTool(tool: EditableFeatureTypes, unselect?: boolean): void
        }
    }
}
