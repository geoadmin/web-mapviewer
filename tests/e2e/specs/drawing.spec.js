const { MapBrowserEvent } = require('ol')

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

    function readGeoJsonType(type, callback) {
        cy.readStoreValue('state.drawing.geoJson').then((geoJson) => {
            expect(geoJson.features).to.have.length(1)
            const foundType = geoJson.features[0].geometry.type
            expect(foundType).to.equal(type)
            callback(geoJson)
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
        // @ts-ignore
        const simulatedEvent = new MapBrowserEvent(type, map, event)
        map.handleMapBrowserEvent(simulatedEvent)
        return simulatedEvent
    }

    it.only('creates a marker', () => {
        goToDrawing()
        clickTool('marker')

        cy.get('body').then((body) => {
            const map = body[0]['drawingMap']

            // Create a point, a geojson will appear in the store
            simulateEvent(map, 'pointermove', 10, 20)
            simulateEvent(map, 'pointerdown', 10, 20)
            simulateEvent(map, 'pointerup', 10, 20)
            readGeoJsonType('Point', (geoJson) => {
                const coos = geoJson.features[0].geometry.coordinates
                expect(coos).to.deep.equal([8.334863265307822, 46.66441849804974])
            })

            // Move it, the geojson geometry should move
            simulateEvent(map, 'pointerdown', 10, 20)
            simulateEvent(map, 'pointermove', 200, 40)
            simulateEvent(map, 'pointerdrag', 200, 40)
            simulateEvent(map, 'pointerup', 200, 40)
            readGeoJsonType('Point', (geoJson) => {
                const coos = geoJson.features[0].geometry.coordinates
                expect(coos).to.deep.equal([46.51333, 6.57268])
            })
        })
    })

    it('creates a text', () => {
        goToDrawing()
        clickTool('text')
        cy.get(olSelector).click(100, 100)
        readGeoJsonType('Point')
    })
    it('creates a line', () => {
        goToDrawing()
        clickTool('line')
        cy.get(olSelector).click(100, 100)
        cy.get(olSelector).click(150, 100)
        cy.get(olSelector).click(150, 150)
        cy.get(olSelector).click(150, 150) // finish linestring
        readGeoJsonType('LineString').then((geoJson) => {
            expect(geoJson.geometry.coordinates.length).to.equal(3)
        })
        cy.get(olSelector).click(1, 1) // do nothing, already finished
        readGeoJsonType('LineString').then((geoJson) => {
            expect(geoJson.geometry.coordinates.length).to.equal(3)
        })
    })
    it('creates a polygon', () => {
        goToDrawing()
        clickTool('line')
        cy.get(olSelector).click(100, 100)
        cy.get(olSelector).click(150, 100)
        cy.get(olSelector).click(150, 150)
        cy.get(olSelector).click(100, 100)
        readGeoJsonType('Polygon')
    })
})
