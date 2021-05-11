describe('Drawing', () => {
    function goToDrawing() {
        cy.goToMapView()
        cy.get('[data-cy="menu-button"]').click()
        cy.get('.menu-section-head-title:first').click() // FIXME: how to address a specific menusection
        cy.readStoreValue('state.ui.showDrawingOverlay').then((value) => {
            expect(value).to.equal(true)
        })
    }
    const tools = ['marker', 'text', 'line', 'measure']
    function clickTool(name) {
        expect(tools).to.include(name)
        cy.get(`[data-cy="drawing-${name}`).click()
        cy.readStoreValue('state.drawing.mode').then((value) => {
            expect(value).to.equal(name.toUpperCase())
        })
    }
    const olSelector = '.ol-viewport'

    function readGeoJsonType(type) {
        cy.readStoreValue('state.drawing.geoJson').then((geoJson) => {
            expect(geoJson.features).to.have.length(1)
            const foundType = geoJson.features[0].geometry.type
            expect(foundType).to.equal(type)
        })
    }

    it('create a marker', () => {
        goToDrawing()
        clickTool('marker')
        cy.get(olSelector).click(100, 100)
        readGeoJsonType('Point')
    })
    it('create a text', () => {
        goToDrawing()
        clickTool('text')
        cy.get(olSelector).click(100, 100)
        readGeoJsonType('Point')
    })
    it('create a line', () => {
        goToDrawing()
        clickTool('line')
        cy.get(olSelector).click(100, 100)
        cy.get(olSelector).click(150, 100)
        cy.get(olSelector).click(150, 150)
        readGeoJsonType('LineString')
    })
    it.only('create a polygon', () => {
        goToDrawing()
        clickTool('line')
        cy.get(olSelector).click(100, 100)
        cy.get(olSelector).click(150, 100)
        cy.get(olSelector).click(150, 150)
        cy.get(olSelector).click(100, 100)
        readGeoJsonType('Polygon')
    })
})
