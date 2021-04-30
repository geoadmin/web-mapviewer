const menuSelector = '[data-cy="menu-button"]'
const drawBtnSelector = '[data-cy="draw-menu-section"]'
const markerBtnSelector = '[data-cy="draw-mode-MARKER"]'
const mapSelector = '[data-cy="map"]'

describe('Test the save drawing', () => {
    beforeEach(() => {
        cy.goToMapView()
    })

    it('draw point', () => {
        cy.mockupBackendResponse('files', { fileId: 'test', adminId: 'test' }, 'files')
        cy.get(menuSelector).should('be.visible')
        cy.get(menuSelector).click()
        cy.get(drawBtnSelector).should('be.visible')
        cy.get(drawBtnSelector).click()
        cy.get(markerBtnSelector).should('be.visible')
        cy.get(markerBtnSelector).click()
        cy.get(mapSelector).click('center')
        cy.wait('@files').then((interception) => {
            cy.log(JSON.stringify(interception))
            expect(interception.request.headers['content-type']).to.be.eq(
                'application/vnd.google-earth.kml+xml'
            )
        })
    })
})
