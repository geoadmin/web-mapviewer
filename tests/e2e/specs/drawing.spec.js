const mockResponse = { fileId: 'test', adminId: 'test' }

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
    it('create a polygon', () => {
        goToDrawing()
        clickTool('line')
        cy.get(olSelector).click(100, 100)
        cy.get(olSelector).click(150, 100)
        cy.get(olSelector).click(150, 150)
        cy.get(olSelector).click(100, 100)
        readGeoJsonType('Polygon')
    })
    it('test saving', () => {
        const checkResponse = (interception, types, create = false) => {
            if (!create) {
                const urlArray = interception.request.url.split('/')
                const id = urlArray[urlArray.length - 1]
                expect(id).to.be.eq(mockResponse.adminId)
            }
            expect(interception.request.headers['content-type']).to.be.eq(
                'application/vnd.google-earth.kml+xml'
            )
            expect(interception.request.body).to.be.contain('</kml>')
            types.forEach((type) => expect(interception.request.body).to.be.contain(type))
        }

        cy.mockupBackendResponse('files', mockResponse, 'saveFile')
        cy.mockupBackendResponse('files/**', { ...mockResponse, status: 'updated' }, 'modifyFile')

        goToDrawing()
        clickTool('marker')

        cy.get(olSelector).dblclick('center')
        cy.wait('@saveFile').then((interception) => checkResponse(interception, ['MARKER'], true))
        cy.readStoreValue('state.drawing.drawingKmlIds').then((ids) => {
            expect(ids.adminId).to.eq('test')
            expect(ids.fileId).to.eq('test')
        })

        cy.get(olSelector).click('center')
        cy.wait('@modifyFile').then((interception) => checkResponse(interception, ['MARKER']))
        clickTool('line')
        cy.get(olSelector).click(100, 100)
        cy.get(olSelector).dblclick(150, 100)
        cy.wait('@modifyFile').then((interception) =>
            checkResponse(interception, ['MARKER', 'LINE'])
        )
        cy.readStoreValue('state.drawing.drawingKmlIds').then((ids) => {
            expect(ids.adminId).to.eq('test')
            expect(ids.fileId).to.eq('test')
        })
    })
})
