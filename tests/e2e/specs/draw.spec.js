const menuSelector = '[data-cy="menu-button"]'
const drawBtnSelector = '[data-cy="draw-menu-section"]'
const markerBtnSelector = '[data-cy="draw-mode-MARKER"]'
const mapSelector = '[data-cy="map"]'

const mockResponse = { fileId: 'test', adminId: 'test' }

describe('Test drawing', () => {
    beforeEach(() => {
        cy.goToMapView()
    })

    context('Point', () => {
        it('draw & modify point', () => {
            cy.mockupBackendResponse('files', mockResponse, 'saveFile')
            cy.mockupBackendResponse(
                'files/**',
                { ...mockResponse, status: 'updated' },
                'modifyFile'
            )
            cy.get(menuSelector).should('be.visible')
            cy.get(menuSelector).click()
            cy.get(drawBtnSelector).should('be.visible')
            cy.get(drawBtnSelector).click()
            cy.get(markerBtnSelector).should('be.visible')
            cy.get(markerBtnSelector).click()
            cy.get(mapSelector).click('center')
            cy.wait('@saveFile').then((interception) => {
                expect(interception.request.headers['content-type']).to.be.eq(
                    'application/vnd.google-earth.kml+xml'
                )
                expect(interception.request.body).to.be.contain('</kml>')
            })
            cy.readStoreValue('getters.getFeatures').then((features) => {
                expect(features).to.be.an('Array')
                expect(features.length).to.eq(1)
                expect(features[0].properties.adminId).to.eq('test')
            })
            // eslint-disable-next-line cypress/no-unnecessary-waiting
            cy.wait(500) // wait while point will be visible
            cy.get(mapSelector).click('center')
            cy.wait('@modifyFile').then((interception) => {
                const urlArray = interception.request.url.split('/')
                const id = urlArray[urlArray.length - 1]
                expect(id).to.be.eq(mockResponse.adminId)
                expect(interception.request.headers['content-type']).to.be.eq(
                    'application/vnd.google-earth.kml+xml'
                )
                expect(interception.request.body).to.be.contain('</kml>')
            })
        })
    })
})
