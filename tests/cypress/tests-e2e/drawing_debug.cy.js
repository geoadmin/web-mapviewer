/// <reference types="cypress" />

import { checkKMLRequest } from 'tests/cypress/support/drawing'

import { EditableFeatureTypes } from '@/api/features/EditableFeature.class'
import { DEFAULT_ICON_URL_PARAMS } from '@/api/icon.api'
import { allStylingSizes, GREEN, LARGE, RED } from '@/utils/featureStyleUtils'
import { LEGACY_ICON_XML_SCALE_FACTOR } from '@/utils/kmlUtils'
import { randomIntBetween } from '@/utils/numberUtils'

const DEFAULT_ICON_URL_SCALE = `${DEFAULT_ICON_URL_PARAMS.scale}x`

describe('Drawing module tests', () => {
    context('Drawing mode/tools', () => {
        beforeEach(() => {
            cy.goToDrawing()
        })
        it('marker (description) not saved when closing immediately after', () => {
            // it should load all icon sets as soon as we enter the drawing module
            cy.wait('@icon-sets')
            cy.wait('@icon-set-default')

            cy.log('Open image embed popup')
            cy.clickDrawingTool(EditableFeatureTypes.MARKER)
            cy.get('[data-cy="ol-map"]:visible').click(60, 160)
            cy.wait('@post-kml').then((interception) => {
                const kmlId = `KML|https://sys-public.dev.bgdi.ch/api/kml/files/${interception.response.body.id}`
                const bgLayer = 'test.background.layer2'
                const valid_url = 'http:dummy'

                cy.get('[data-cy="drawing-style-image-button"]').click()
                cy.get('[data-cy="drawing-style-media-url-input"]').type(valid_url)
                cy.get('[data-cy="drawing-style-media-generate-button"]').click()

                cy.get('[data-cy="drawing-style-feature-description"]').should(
                    'have.value',
                    `<image src="${valid_url}" style="max-height:200px;"/>`
                )
                cy.get('[data-cy="infobox-close"]').click()

                cy.closeDrawingMode()
                cy.closeMenuIfMobile()
                cy.checkOlLayer([bgLayer, kmlId])

                cy.log('Image link exists after sanitize')
                cy.get('[data-cy="ol-map"]').click(60, 160)
                cy.get('[data-cy="feature-detail-description-content"]')
                    .find('img')
                    .invoke('attr', 'src')
                    .should('eq', `${valid_url}`)
            })
        })

        it('previous marker infobox not properly closed when new one is opened', () => {
            // it should load all icon sets as soon as we enter the drawing module
            cy.wait('@icon-sets')
            cy.wait('@icon-set-default')

            cy.clickDrawingTool(EditableFeatureTypes.MARKER)
            cy.get('[data-cy="ol-map"]:visible').click()
            cy.wait('@post-kml')

            cy.log('Can generate and display media links')
            const valid_url = 'http:dummy'

            cy.clickDrawingTool(EditableFeatureTypes.MARKER)
            cy.get('[data-cy="ol-map"]').click(40, 160)

            cy.log('Open hyperlink popup')
            cy.get('[data-cy="drawing-style-image-button"]').click()
            cy.get('[data-cy="drawing-style-media-url-input"]').type(valid_url)
            cy.get('[data-cy="drawing-style-media-generate-button"]').click()
            cy.get('[data-cy="drawing-style-feature-description"]').should(
                'have.value',
                `<image src="${valid_url}" style="max-height:200px;"/>`
            )

            cy.clickDrawingTool(EditableFeatureTypes.MARKER)
            cy.get('[data-cy="ol-map"]').click(80, 160)
            cy.get('[data-cy="drawing-style-video-button"]').click()
            cy.get('[data-cy="drawing-style-media-url-input"]').type(valid_url)
            cy.get('[data-cy="drawing-style-media-generate-button"]').click()
            cy.get('[data-cy="drawing-style-feature-description"]').should(
                'have.value',
                `<iframe src="${valid_url}" height="200" width="auto"></iframe>`
            )
        })
    })
})
