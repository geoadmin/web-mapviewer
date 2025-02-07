import { randomIntBetween } from 'geoadmin/numbers'
import pako from 'pako'

import { EditableFeatureTypes } from '@/api/features/EditableFeature.class'
import { GREEN, RED } from '@/utils/featureStyleUtils'

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
    cy.intercept('**/rest/services/profile.json**', {
        fixture: 'service-alti/profile.fixture.json',
    }).as('profile')
    cy.intercept('**/rest/services/profile.csv**', {
        fixture: 'service-alti/profile.fixture.csv',
    }).as('profileAsCsv')
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
                Cypress.log({
                    name: 'addFileAPIFixtureAndIntercept',
                    message: `failed to get KML from request`,
                    consoleProps() {
                        return {
                            req: req,
                            error: error,
                        }
                    },
                })
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
    cy.intercept('HEAD', `**/api/kml/files/**`, {
        statusCode: 200,
        headers: {
            'Content-Type': 'application/vnd.google-earth.kml+xml',
        },
    }).as('head-kml')
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
    cy.readStoreValue('state.drawing.drawingOverlay.show').should('be.true')
    cy.waitUntilState((state) => state.drawing.iconSets.length > 0)
})

Cypress.Commands.add('openDrawingMode', () => {
    cy.openMenuIfMobile()
    cy.get('[data-cy="menu-tray-drawing-section"]').should('be.visible').click()
    // Make sure that the map pointer events are unregistered to avoid intereference with drawing
    // pointer events
    cy.window().its('mapPointerEventReady').should('be.false')
})

Cypress.Commands.add('closeDrawingMode', (closeDrawingNotSharedAdmin = true) => {
    cy.get('[data-cy="drawing-toolbox-close-button"]', { timeout: 10000 })
        .should('be.visible')
        .click()

    if (closeDrawingNotSharedAdmin) {
        // Close the drawing not shared admin modal if it is open
        cy.get('body').then(($body) => {
            if ($body.find('[data-cy="drawing-share-admin-close"]').length > 0) {
                cy.get('[data-cy="drawing-share-admin-close"]').click()
            }
        })
        cy.window().its('store.state.drawing.drawingOverlay.show').should('be.false')
        // In drawing mode the click event on the map are removed therefore we need to wait that
        // they are added again begore continuing testing
        cy.waitMapIsReady()
    }
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
        Cypress.log({
            name: 'getKmlAdminIdFromRequest',
            message: `Failed to get KML admin_id from the request`,
            consoleProps() {
                return {
                    req,
                    error,
                }
            },
        })
        return '1234_adminId'
    }
}

export async function getKmlFromRequest(req) {
    let paramBlob
    try {
        const formData = await new Response(req.body, { headers: req.headers }).formData()
        paramBlob = await formData.get('kml').arrayBuffer()
    } catch (error) {
        Cypress.log({
            name: 'getKMLRequest',
            message: `Failed to parse the multipart/form-data of the KML request payload`,
            consoleProps() {
                return {
                    body: `${req.body}`,
                    headers: `${req.headers}`,
                    error: `${error}`,
                }
            },
        })
        expect(
            `Failed to parse the multipart/form-data of the KML request payload for ${req.method} ${req.url}`
        ).to.be.false
    }
    try {
        const unzippedKml = new TextDecoder().decode(pako.ungzip(paramBlob))
        Cypress.log({
            name: 'getKMLRequest',
            message: 'state of intercepted data',
            consoleProps() {
                return {
                    url: `${req.url}`,
                    kml: unzippedKml,
                    headers: `${JSON.stringify(req.headers, null, 2)}`,
                }
            },
        })
        return unzippedKml
    } catch (error) {
        Cypress.log({
            name: 'getKMLRequest',
            message: 'Failed to unzip KML file from payload',
            consoleProps() {
                return {
                    req,
                    error,
                }
            },
        })
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
    // minimizing the use of KML directly in "expect", so that Cypress log doesn't get cluttered
    // with the entire KML data on each test.
    // getKmlFromRequest will output an opt-in dump in the JS console if needed.
    expect(typeof kml).to.equals('string')
    expect(kml.indexOf('</kml>')).to.not.be.equal(-1)
    data.forEach((test) => {
        if (test instanceof RegExp) {
            expect(test.test(kml), `KML content did not match ${test}`).to.be.true
        } else {
            expect(kml.indexOf(test), `KML content did not contain ${test}`).to.not.be.equal(-1)
        }
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
