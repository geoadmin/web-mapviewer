import { randomIntBetween } from '@swissgeo/numbers'
import pako from 'pako'

import { EditableFeatureTypes } from '@/api/features.api'
import { generateRGBFillString, GREEN, RED } from '@/utils/featureStyleUtils'

import type { CyHttpMessages } from 'cypress/types/net-stubbing'

function transformHeaders(headers: { [key: string]: string | string[] }): HeadersInit {
    const transformedHeaders: HeadersInit = {}

    for (const [key, value] of Object.entries(headers)) {
        if (Array.isArray(value)) {
            transformedHeaders[key] = value.join(',')
        } else {
            transformedHeaders[key] = value
        }
    }

    return transformedHeaders
}

export function addIconFixtureAndIntercept(): void {
    cy.intercept(`**/api/icons/sets/default/icons/**${generateRGBFillString(RED)}.png`, {
        fixture: 'service-icons/placeholder.png',
    }).as('icon-default')
    cy.intercept(`**/api/icons/sets/default/icons/**${generateRGBFillString(GREEN)}.png`, {
        fixture: 'service-icons/placeholder.png',
    }).as('icon-default-green')
    cy.intercept(`**/api/icons/sets/babs/icons/*@*.png`, {
        fixture: 'service-icons/placeholder.png',
    }).as('icon-babs')
}

export function addLegacyIconFixtureAndIntercept(): void {
    // /color/{r},{g},{b}/{image}-{size}@{scale}x.png
    cy.intercept(`**/color/*,*,*/*@*.png`, {
        fixture: 'service-icons/placeholder.png',
    }).as('legacy-icon-default')
    //  /images/{set_name}/{image}
    cy.intercept(`**/images/*.png`, {
        fixture: 'service-icons/placeholder.png',
    }).as('legacy-icon-babs')
}

function addProfileFixtureAndIntercept(): void {
    cy.intercept('**/rest/services/profile.json**', {
        fixture: 'service-alti/profile.fixture.json',
    }).as('profile')
    cy.intercept('**/rest/services/profile.csv**', {
        fixture: 'service-alti/profile.fixture.csv',
    }).as('profileAsCsv')
}

function addFileAPIFixtureAndIntercept(): void {
    let kmlBody: string | FormData | undefined
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
                    id: `${Date.now()}_${randomIntBetween(1000, 9999)}_fileId`,
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
            req.reply(kmlMetadataTemplate({ id: req.url.split('/').pop()!, adminId }))
        }
    ).as('update-kml')
    cy.intercept(
        {
            method: 'GET',
            url: '**/api/kml/admin/**',
        },
        (req) => {
            const headers = { 'Cache-Control': 'no-cache' }
            req.reply(kmlMetadataTemplate({ id: req.url.split('/').pop()! }), headers)
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
    cy.intercept(
        {
            method: 'DELETE',
            url: '**/api/kml/admin/**',
        },
        async (req) => {
            try {
                const formData = await new Response(req.body, {
                    headers: transformHeaders(req.headers),
                }).formData()
                const adminId = formData.get('admin_id')
                const id = req.url.split('/').pop()

                if (!id) {
                    throw new Error('Missing id in DELETE request FormData')
                }
                if (!adminId) {
                    throw new Error('Missing admin_id in DELETE request FormData')
                }
                if (adminId instanceof File) {
                    throw new Error('DELETE request FormData should not contain a File')
                }

                req.reply(kmlMetadataTemplate({ id, adminId }))
            } catch (error) {
                Cypress.log({
                    name: 'delete-kml-intercept',
                    message: `Failed to extract FormData from DELETE request`,
                    consoleProps() {
                        return {
                            request: JSON.stringify(req),
                            error: JSON.stringify(error),
                        }
                    },
                })
                expect('Failed to extract FormData from DELETE request').to.be.false
            }
        }
    ).as('delete-kml')
}

Cypress.Commands.add('goToDrawing', (queryParams = {}, withHash = true) => {
    addIconFixtureAndIntercept()
    addProfileFixtureAndIntercept()
    addFileAPIFixtureAndIntercept()
    cy.goToMapView({ queryParams, withHash })
    cy.window()
        .its('map')
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
    cy.get('[data-cy="drawing-toolbox-close-button"]:visible', { timeout: 10000 }).click()

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
    cy.get(`[data-cy="drawing-toolbox-mode-button-${name}"]:visible`).click()
    if (unselect) {
        cy.readStoreValue('state.drawing.mode').should('eq', null)
    } else {
        cy.readStoreValue('state.drawing.mode').should('eq', name)
    }
})

export async function getKmlAdminIdFromRequest(
    req: CyHttpMessages.IncomingHttpRequest
): Promise<string> {
    try {
        const formData = await new Response(req.body, {
            headers: transformHeaders(req.headers),
        }).formData()
        return formData.get('admin_id') as string
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

function isGzip(u8: Uint8Array): boolean {
    return u8.length > 2 && u8[0] === 0x1f && u8[1] === 0x8b
}
function isZlib(u8: Uint8Array): boolean {
    // Common zlib CMF values start with 0x78 (not perfect but good heuristic)
    return u8.length > 2 && u8[0] === 0x78
}


export async function getKmlFromRequest(req: CyHttpMessages.IncomingHttpRequest) {
    let paramBlob: ArrayBuffer | string | null = null
    try {
        const formData = await new Response(req.body, {
            headers: transformHeaders(req.headers),
        }).formData()

        if (req.method === 'DELETE') {
            if (!formData.has('admin_id')) {
                throw new Error('DELETE request missing admin_id in FormData')
            }
            return formData // Return raw FormData object for DELETE
        }
        const fileOrContentString = formData.get('kml')
        if (fileOrContentString instanceof File) {
            paramBlob = await fileOrContentString.arrayBuffer()
        } else if (fileOrContentString !== null) {
            paramBlob = fileOrContentString
        }
    } catch (error) {
        Cypress.log({
            name: 'getKMLRequest',
            message: `Failed to parse the multipart/form-data of the KML request payload`,
            consoleProps() {
                return {
                    body: JSON.stringify(req.body),
                    headers: JSON.stringify(req.headers),
                    error: JSON.stringify(error),
                }
            },
        })
        expect(
            `Failed to parse the multipart/form-data of the KML request payload for ${req.method} ${req.url}`
        ).to.be.false
    }
    if (paramBlob === null || !(paramBlob instanceof ArrayBuffer)) {
        return
    }
    try {
        const u8 = new Uint8Array(paramBlob)

        let kmlBytes: Uint8Array
        let compressionType: string
        if (isGzip(u8)) {
            kmlBytes = pako.ungzip(u8)
            compressionType = 'gzip'
        } else if (isZlib(u8)) {
            // Try zlib; if that fails, attempt raw DEFLATE as fallback
            try {
                kmlBytes = pako.inflate(u8)
                compressionType = 'zlib'
            } catch {
                kmlBytes = pako.inflateRaw(u8)
                compressionType = 'raw DEFLATE'
            }
        } else {
            // Assume plain UTF-8 KML
            const unzippedKml = new TextDecoder().decode(u8)
            Cypress.log({
                name: 'getKMLRequest',
                message: 'state of intercepted data (plain text)',
                consoleProps() {
                    return {
                        url: `${req.url}`,
                        compressionType: 'none',
                        kml: unzippedKml,
                        headers: `${JSON.stringify(req.headers, null, 2)}`,
                    }
                },
            })
            return unzippedKml
        }
        const unzippedKml = new TextDecoder().decode(kmlBytes)
        Cypress.log({
            name: 'getKMLRequest',
            message: `state of intercepted data (${compressionType})`,
            consoleProps() {
                return {
                    url: `${req.url}`,
                    compressionType: compressionType,
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

export async function checkKMLRequest(
    request: CyHttpMessages.IncomingHttpRequest,
    data: (RegExp | string)[],
    updatedKmlId?: string
) {
    // Check request
    if (updatedKmlId) {
        const urlArray = request.url.split('/')
        const id = urlArray[urlArray.length - 1]
        expect(id).to.be.eq(updatedKmlId)
    }
    expect(request.headers['content-type']).to.contain('multipart/form-data; boundary=')

    const kml = await getKmlFromRequest(request)
    // minimizing the use of KML directly in "expect", so that Cypress index doesn't get cluttered
    // with the entire KML data on each test.
    // getKmlFromRequest will output an opt-in dump in the JS console if needed.
    expect(kml).to.be.a('string')
    const kmlString: string = kml as string
    expect(kmlString.indexOf('</kml>')).to.not.be.equal(-1)
    data.forEach((test) => {
        if (test instanceof RegExp) {
            expect(test.test(kmlString), `KML content did not match ${test}`).to.be.true
        } else {
            expect(kmlString.indexOf(test), `KML content did not contain ${test}`).to.not.be.equal(
                -1
            )
        }
    })
}

interface KmlTestMetadata {
    id: string | number
    adminId?: string | number
}

export function kmlMetadataTemplate(data: KmlTestMetadata): Record<string, unknown> {
    const metadata: Record<string, unknown> = {
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
