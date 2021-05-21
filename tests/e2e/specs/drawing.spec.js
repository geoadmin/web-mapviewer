const mockResponse = { fileId: 'test', adminId: 'test' }
const { MapBrowserEvent } = require('ol')

describe('Drawing', () => {
    function goToDrawing() {
        cy.goToMapView()
        cy.get('[data-cy="menu-button"]').click()
        cy.get('.menu-section-head-title:first').click() // FIXME: how to address a specific menusection
        cy.readStoreValue('state.ui.showDrawingOverlay').should('be.true')
    }

    const tools = ['marker', 'text', 'line', 'measure']

    function clickTool(name) {
        expect(tools).to.include(name)
        cy.get(`[data-cy="drawing-${name}`).click()
        cy.readStoreValue('state.drawing.mode').should('eq', name.toUpperCase())
    }

    const olSelector = '.ol-viewport'

    function readGeoJsonType(type, callback) {
        cy.readStoreValue('state.drawing.geoJson').then((geoJson) => {
            expect(geoJson.features).to.have.length(1)
            const foundType = geoJson.features[0].geometry.type
            expect(foundType).to.equal(type)
            if (callback) callback(geoJson)
        })
    }

    function checkGeoJsonProperty(key, expected) {
        cy.readStoreValue('state.drawing.geoJson').then((geoJson) => {
            expect(geoJson.features).to.have.length(1)
            const v = geoJson.features[0].properties[key]
            expect(v).to.equal(expected)
        })
    }

    /**
     * This fonction has been taken from the OL draw spec. Simulates a browser event on the map
     * viewport. The client x/y location will be adjusted as if the map were centered at 0,0.
     *
     * @param {string} type Event type.
     * @param {number} x Horizontal offset from map center.
     * @param {number} y Vertical offset from map center.
     * @param {boolean} [opt_shiftKey] Shift key is pressed.
     * @param {number} [opt_pointerId] Pointer id.
     * @returns {MapBrowserEvent} The simulated event.
     */
    function simulateEvent(map, type, x, y, opt_shiftKey, opt_pointerId = 0) {
        cy.log(`simulating ${type} at [${x}, ${y}]`)

        var viewport = map.getViewport()
        let position = viewport.getBoundingClientRect()

        // calculated in case body has top < 0 (test runner with small window)
        const shiftKey = opt_shiftKey !== undefined ? opt_shiftKey : false
        const event = {}
        event.type = type
        event.target = viewport.firstChild
        event.clientX = position.left + x + position.width / 2
        event.clientY = position.top + y + position.height / 2
        event.shiftKey = shiftKey
        event.preventDefault = function () {}
        event.pointerType = 'mouse'
        event.pointerId = opt_pointerId
        event.isPrimary = true
        event.button = 0
        // @ts-ignore
        const simulatedEvent = new MapBrowserEvent(type, map, event)
        map.handleMapBrowserEvent(simulatedEvent)
        return simulatedEvent
    }

    const getDrawingMap = () => cy.get('body').then((body) => body[0]['drawingMap'])

    it('creates a marker', () => {
        goToDrawing()
        clickTool('marker')
        getDrawingMap().then((map) => {
            // Create a point, a geojson will appear in the store
            simulateEvent(map, 'pointermove', 0, 0)
            simulateEvent(map, 'pointerdown', 0, 0)
            simulateEvent(map, 'pointerup', 0, 0)
            readGeoJsonType('Point', (geoJson) => {
                const coos = geoJson.features[0].geometry.coordinates
                expect(coos).to.eql(
                    [8.224999984057822, 46.81500000237665],
                    `bad: ${JSON.stringify(coos)}`
                )
            })
        })

        getDrawingMap().then((map) => {
            // Move it, the geojson geometry should move
            simulateEvent(map, 'pointerdown', 0, 0)
            simulateEvent(map, 'pointermove', 200, 140)
            simulateEvent(map, 'pointerdrag', 200, 140)
            simulateEvent(map, 'pointerup', 200, 140)
            readGeoJsonType('Point', (geoJson) => {
                const coos = geoJson.features[0].geometry.coordinates
                expect(coos).to.eql(
                    [10.42226560905782, 45.7520927843664],
                    `bad: ${JSON.stringify(coos)}`
                )
            })
        })

        cy.get('#text').type('This is a title')
        checkGeoJsonProperty('text', 'This is a title')

        cy.get('#description').type('This is a description')
        checkGeoJsonProperty('description', 'This is a description')
    })

    it('creates a text', () => {
        goToDrawing()
        clickTool('text')
        cy.get(olSelector).click(100, 100)
        readGeoJsonType('Point')
    })

    it('creates a polygon by re-clicking first point', () => {
        goToDrawing()
        clickTool('line')
        cy.get(olSelector).click(100, 100)
        cy.get(olSelector).click(150, 100)
        cy.get(olSelector).click(150, 150)
        cy.get(olSelector).click(100, 100)
        readGeoJsonType('Polygon')
    })

    // FIXME: it is currently not possible to draw lines
    it.skip('creates a line with double click', () => {
        goToDrawing()
        clickTool('line')
        cy.get(olSelector).click(100, 100)
        cy.get(olSelector).click(150, 150)
        cy.get(olSelector).dblclick(120, 240)
        readGeoJsonType('LineString', (geoJson) => {
            expect(geoJson.geometry.coordinates.length).to.equal(3)
        })
        cy.get(olSelector).click(1, 1) // do nothing, already finished
        readGeoJsonType('LineString', (geoJson) => {
            expect(geoJson.geometry.coordinates.length).to.equal(3)
        })
    })

    const checkResponse = (interception, types, create = false) => {
        if (!create) {
            const urlArray = interception.request.url.split('/')
            const id = urlArray[urlArray.length - 1]
            expect(id).to.be.eq(mockResponse.adminId)
        }
        expect(interception.request.headers['content-type']).to.be.eq(
            'application/vnd.google-earth.kml+xml'
        )
        expect(interception.request.body).to.contain('</kml>')
        types.forEach((type) => expect(interception.request.body).to.contain(type))
    }

    it('saves a KML on draw end', () => {
        cy.mockupBackendResponse('files', mockResponse, 'saveFile')
        cy.mockupBackendResponse('files/**', { ...mockResponse, status: 'updated' }, 'modifyFile')

        goToDrawing()
        clickTool('marker')

        cy.get(olSelector).dblclick('center')
        cy.wait('@saveFile').then((interception) => checkResponse(interception, ['MARKER'], true))
        cy.readStoreValue('state.drawing.drawingKmlIds').then((ids) => {
            expect(ids.adminId).to.eq(mockResponse.adminId)
            expect(ids.fileId).to.eq(mockResponse.fileId)
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
            expect(ids.adminId).to.eq(mockResponse.adminId)
            expect(ids.fileId).to.eq(mockResponse.fileId)
        })
    })
})
