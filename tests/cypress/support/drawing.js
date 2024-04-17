import pako from 'pako'

import { EditableFeatureTypes } from '@/api/features/EditableFeature.class'
import { BREAKPOINT_PHONE_WIDTH } from '@/config'
import { GREEN, RED } from '@/utils/featureStyleUtils'
import { randomIntBetween } from '@/utils/numberUtils'

export const addIconFixtureAndIntercept = () => {
    cy.intercept(`**/api/icons/sets/default/icons/**${RED.rgbString}.png`, {
        fixture: 'service-icons/placeholder.png',
    }).as('icon-default')
    cy.intercept(`**/api/icons/sets/default/icons/**${GREEN.rgbString}.png`, {
        fixture: 'service-icons/placeholder.png',
    }).as('icon-default-green')
    cy.intercept(`**/api/icons/sets/babs/icons/*@*.png`, {
        fixture: 'service-icons/placeholder.png',
    }).as('icon-babs')
}

export const addLegacyIconFixtureAndIntercept = () => {
    // /color/{r},{g},{b}/{image}-{size}@{scale}x.png
    cy.intercept(`**/color/*,*,*/*@*.png`, {
        fixture: 'service-icons/placeholder.png',
    }).as('legacy-icon-default')
    //  /images/{set_name}/{image}
    cy.intercept(`**/images/*.png`, {
        fixture: 'service-icons/placeholder.png',
    }).as('legacy-icon-babs')
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

const addFileAPIFixtureAndIntercept = () => {
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
            req.reply(
                201,
                kmlMetadataTemplate({
                    id: `${randomIntBetween(1000, 9999)}_fileId`,
                    adminId: `1234_adminId`,
                })
            )
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
        } else {
            req.reply({
                fixture: 'service-kml/lonelyMarker.kml',
                headers: headers,
            })
        }
    }).as('get-kml')
}

Cypress.Commands.add('goToDrawing', (queryParams = {}, withHash = true) => {
    addIconFixtureAndIntercept()
    addProfileFixtureAndIntercept()
    addFileAPIFixtureAndIntercept()
    cy.goToMapView(queryParams, withHash)
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
    cy.get('[data-cy="menu-tray-drawing-section"]').should('be.visible').click()
    // Make sure that the map pointer events are unregistered to avoid intereference with drawing
    // pointer events
    cy.window().its('mapPointerEventReady').should('be.false')
})

Cypress.Commands.add('closeDrawingMode', () => {
    cy.get('[data-cy="drawing-toolbox-close-button"]', { timeout: 10000 })
        .should('be.visible')
        .click()
    cy.window().its('store.state.ui.showDrawingOverlay').should('be.false')
    // In drawing mode the click event on the map are removed therefore we need to wait that
    // they are added again begore continuing testing
    cy.waitMapIsReady()
})

Cypress.Commands.add('clickDrawingTool', (name, unselect = false) => {
    expect(Object.values(EditableFeatureTypes)).to.include(name)
    cy.get(`[data-cy="drawing-toolbox-mode-button-${name}`).should('be.visible').click()
    if (unselect) {
        cy.readStoreValue('state.drawing.mode').should('eq', null)
    } else {
        cy.readStoreValue('state.drawing.mode').should('eq', name)
    }
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
    console.log(`getKMLRequest ${req.method} ${req.url} body=${req.body}`)
    console.log(`getKMLRequest ${req.method} ${req.url} blob=${paramBlob}`)
    try {
        const kml = new TextDecoder().decode(pako.ungzip(paramBlob))
        console.log(`getKMLRequest ${req.method} ${req.url} kml=${kml}`)
        return kml
    } catch (error) {
        console.error(`Failed to unzip KML file from payload`, req, error)
        expect(`Failed to unzip KML file from request payload for ${req.method} ${req.url}`).to.be
            .false
    }
}

export async function checkKMLRequest(request, data, updated_kml_id = null) {
    // Check request
    if (updated_kml_id) {
        const urlArray = request.url.split('/')
        const id = urlArray[urlArray.length - 1]
        expect(id).to.be.eq(updated_kml_id)
    }
    expect(request.headers['content-type']).to.contain('multipart/form-data; boundary=')

    const kml = await getKmlFromRequest(request)
    expect(kml).to.contain('</kml>')
    data.forEach((test) => {
        const condition = test instanceof RegExp ? 'match' : 'contain'
        expect(kml).to[condition](test)
    })
}

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

/**
 * Wait until all defaults red icons have been loaded
 *
 * This wait is required when checking the KML XML content, because openlayer requires the icon size
 * from the icon request in order to compute the icon scale in KML, if the icon is not loaded when
 * saving the KML, openlayer uses a default size of 64 pixel which defer from our icon size of 48
 * pixel.
 *
 * So before doing an action that would change the icon size, we need to make sure that all icons
 * have been already loaded to avoid any race condition.
 *
 * This wait is only needed in cypress as in real life the save has a debouncing of at least 2
 * seconds which ensure that we have the icons.
 */
Cypress.Commands.add('waitOnAllIconsDefault', () => {
    cy.get('@icon-set-default').then((interception) => {
        cy.wait(Array(interception.response.body.items.length).fill('@icon-default'))
    })
})

/**
 * Wait until all defaults green icons have been loaded
 *
 * @see waitOnAllIconsDefault for more infos
 */
Cypress.Commands.add('waitOnAllIconsDefaultGreen', () => {
    cy.get('@icon-set-default').then((interception) => {
        cy.wait(Array(interception.response.body.items.length).fill('@icon-default-green'))
    })
})
