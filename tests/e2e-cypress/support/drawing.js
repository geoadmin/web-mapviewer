import pako from 'pako'

import { EditableFeatureTypes } from '@/api/features.api'
import LayerTypes from '@/api/layers/LayerTypes.enum'
import { BREAKPOINT_PHONE_WIDTH } from '@/config'

const olSelector = '.ol-viewport'

const addIconFixtureAndIntercept = () => {
    cy.intercept(`**/api/icons/sets/default/icons/**@1x-255,0,0.png`, {
        fixture: 'service-icons/placeholder.png',
    }).as('icon-default')
    cy.intercept(`**/api/icons/sets/babs/icons/**@1x.png`, {
        fixture: 'service-icons/placeholder.png',
    }).as('icon-babs')
}

const addProfileFixtureAndIntercept = () => {
    cy.intercept(
        {
            method: 'POST',
            url: `**/rest/services/profile.json**`,
        },
        {
            body: [],
        }
    ).as('profile')
}

const addFileAPIFixtureAndIntercept = (kmlFileFixtureFile = 'service-kml/lonelyMarker.kml') => {
    let kmlBody = null
    cy.intercept(
        {
            method: 'POST',
            url: '**/api/kml/admin',
        },
        async (req) => {
            try {
                kmlBody = await getKmlFromRequest(req)
            } catch (error) {
                console.error(`failed to get KML from request`, error)
            }
            req.reply(201, kmlMetadataTemplate({ id: '1234_fileId', adminId: '1234_adminId' }))
        }
    ).as('post-kml')
    cy.intercept(
        {
            method: 'PUT',
            url: '**/api/kml/admin/**',
        },
        async (req) => {
            const adminId = await getKmlAdminIdFromRequest(req)
            kmlBody = await getKmlFromRequest(req)
            req.reply(kmlMetadataTemplate({ id: req.url.split('/').pop(), adminId: adminId }))
        }
    ).as('update-kml')
    cy.intercept(
        {
            method: 'GET',
            url: '**/api/kml/admin/**',
        },
        (req) => {
            const headers = { 'Cache-Control': 'no-cache' }
            req.reply(kmlMetadataTemplate({ id: req.url.split('/').pop() }), headers)
        }
    ).as('get-kml-metadata')
    cy.intercept(
        {
            method: 'GET',
            url: '**/api/kml/admin?admin_id=*',
        },
        (req) => {
            const headers = { 'Cache-Control': 'no-cache' }
            req.reply(kmlMetadataTemplate({ id: 'dummy-id', adminId: req.query.admin_id }), headers)
        }
    ).as('get-kml-metadata-by-admin-id')
    cy.intercept('GET', `**/api/kml/files/**`, (req) => {
        const headers = { 'Cache-Control': 'no-cache' }
        if (kmlBody) {
            req.reply(kmlBody, headers)
        } else if (kmlFileFixtureFile) {
            req.reply({ fixture: kmlFileFixtureFile }, headers)
        } else {
            req.reply('<kml></kml>', headers)
        }
    }).as('get-kml')
}

Cypress.Commands.add('drawGeoms', () => {
    cy.clickDrawingTool(EditableFeatureTypes.MARKER)
    cy.get(olSelector).click(170, 190)
    cy.get('[data-cy="infobox-close"]').click()

    cy.clickDrawingTool(EditableFeatureTypes.ANNOTATION)
    cy.get(olSelector).click(200, 190)
    cy.get('[data-cy="infobox-close"]').click()

    cy.clickDrawingTool(EditableFeatureTypes.LINEPOLYGON)
    cy.get(olSelector).click(100, 200)
    cy.get(olSelector).click(150, 200)
    cy.get(olSelector).click(150, 230)
    cy.get(olSelector).click(100, 200)
    cy.get('[data-cy="infobox-close"]').click()

    cy.drawMeasure()
})

Cypress.Commands.add('drawMeasure', () => {
    cy.clickDrawingTool(EditableFeatureTypes.MEASURE)
    cy.get(olSelector).click(210, 200)
    cy.get(olSelector).click(220, 200)
    cy.get(olSelector).dblclick(230, 230)
})

// https://docs.cypress.io/api/events/catalog-of-events#Uncaught-Exceptions
// As we have some issue with uncaught exception when testing with drawing, we disable the "fail on uncaught" approach
// This exception is typically raised by a call to api3.geo.admin.ch/files/... with a HTTP 200 ERR_INCOMPLETE_CHUNKED_ENCODING error
Cypress.on('uncaught:exception', () => {
    // returning false here prevents Cypress from failing the test
    return false
})

Cypress.Commands.add('goToDrawing', (queryParams = {}, withHash = false) => {
    cy.goToMapViewWithDrawingIntercept(queryParams, withHash)
    cy.readWindowValue('map')
        .then((map) => map.getOverlays().getLength())
        .as('nbOverlaysAtBeginning')
    // opening the drawing mode if no KML with adminId defined in the URL
    // (otherwise, the drawing mode will be opened by default, no need to open it)
    if (!queryParams.layers || queryParams.layers.indexOf('@adminId=') === -1) {
        cy.openDrawingMode()
    }
    cy.readStoreValue('state.ui.showDrawingOverlay').should('be.true')
    cy.waitUntilState((state) => state.drawing.iconSets.length > 0)
})

Cypress.Commands.add('openDrawingMode', () => {
    const viewportWidth = Cypress.config('viewportWidth')
    if (viewportWidth && viewportWidth < BREAKPOINT_PHONE_WIDTH) {
        cy.get('[data-cy="menu-button"]').click()
    }
    cy.get('[data-cy="menu-tray-drawing-section"]').click()
})

Cypress.Commands.add('goToMapViewWithDrawingIntercept', (queryParams = {}, withHash = false) => {
    addIconFixtureAndIntercept()
    addProfileFixtureAndIntercept()
    addFileAPIFixtureAndIntercept()
    cy.goToMapView(queryParams, withHash)
})

Cypress.Commands.add('clickDrawingTool', (name, unselect = false) => {
    expect(Object.values(EditableFeatureTypes)).to.include(name)
    cy.get(`[data-cy="drawing-toolbox-mode-button-${name}`).click()
    if (unselect) {
        cy.readStoreValue('state.drawing.mode').should('eq', null)
    } else {
        cy.readStoreValue('state.drawing.mode').should('eq', name)
    }
})

Cypress.Commands.add('readDrawingFeatures', (type, callback) => {
    cy.readWindowValue('drawingLayer').then((drawingLayer) => {
        const features = drawingLayer.getSource().getFeatures()
        expect(features).to.have.lengthOf(1, 'no feature found in the drawing layer')
        const foundType = features[0].getGeometry().getType()
        expect(foundType).to.equal(type)
        if (callback) {
            callback(features)
        }
    })
})

Cypress.Commands.add('checkDrawnGeoJsonProperty', (key, expected, checkIfContains = false) => {
    cy.readWindowValue('drawingLayer').then((drawingLayer) => {
        const features = drawingLayer.getSource().getFeatures()
        expect(features).to.have.lengthOf(1, 'no feature found in the drawing layer')
        const firstFeature = features[0]
        const keys = key.split('.')
        let value = firstFeature.get('editableFeature')
        for (const k of keys) {
            value = value[k]
        }
        if (checkIfContains) {
            expect(value).to.contain(expected, `${firstFeature} != ${expected}`)
        } else {
            expect(value).to.equal(expected, `${firstFeature} != ${expected}`)
        }
    })
})

export async function getKmlAdminIdFromRequest(req) {
    try {
        const formData = await new Response(req.body, { headers: req.headers }).formData()
        return formData.get('admin_id')
    } catch (error) {
        console.error(`Failed to get KML admin_id from the request`, req, error)
        return '1234_adminId'
    }
}

export async function getKmlFromRequest(req) {
    let paramBlob
    try {
        const formData = await new Response(req.body, { headers: req.headers }).formData()
        paramBlob = await formData.get('kml').arrayBuffer()
    } catch (error) {
        console.error(
            `Failed to parse the mutlipart/form-data of the KML request payload`,
            req,
            error
        )
        expect(
            `Failed to parse the multipart/form-data of the KML request payload for ${req.method} ${req.url}`
        ).to.be.false
    }
    try {
        return new TextDecoder().decode(pako.ungzip(paramBlob))
    } catch (error) {
        console.error(`Failed to unzip KML file from payload`, req, error)
        expect(`Failed to unzip KML file from request payload for ${req.method} ${req.url}`).to.be
            .false
    }
}

Cypress.Commands.add('checkKMLRequest', async (interception, data, updated_kml_id = null) => {
    // Check request
    if (updated_kml_id) {
        const urlArray = interception.request.url.split('/')
        const id = urlArray[urlArray.length - 1]
        expect(id).to.be.eq(updated_kml_id)
    }
    expect(interception.request.headers['content-type']).to.contain(
        'multipart/form-data; boundary='
    )

    const kml = await getKmlFromRequest(interception.request)
    expect(kml).to.contain('</kml>')
    data.forEach((test) => {
        const condition = test instanceof RegExp ? 'match' : 'contain'
        expect(kml).to[condition](test)
    })
})

export function kmlMetadataTemplate(data) {
    let metadata = {
        id: data.id,
        success: true,
        created: '2021-09-09T13:58:29Z',
        updated: '2021-09-09T14:58:29Z',
        author: 'web-mapviewer',
        author_version: '1.0.0',
        links: {
            self: `https://public.geo.admin.ch/kml/admin/${data.id}`,
            kml: `https://public.geo.admin.ch/kml/files/${data.id}`,
        },
    }
    if (data.adminId) {
        metadata.admin_id = data.adminId
    }
    return metadata
}

Cypress.Commands.add('waitUntilDrawingIsAdded', () => {
    cy.waitUntilState(
        (state) =>
            state.layers.activeLayers.filter(
                (layer) => layer.visible && layer.type === LayerTypes.KML
            ).length > 0
    )
})
