const mockResponse = { fileId: 'test', adminId: 'test' }
const { MapBrowserEvent } = require('ol')

describe('Drawing', () => {
    const tools = ['marker', 'text', 'line', 'measure']

    function clickTool(name) {
        expect(tools).to.include(name)
        cy.get(`[data-cy="drawing-${name}`).click()
        cy.readStoreValue('state.drawing.mode').should('eq', name.toUpperCase())
    }

    const olSelector = '.ol-viewport'

    const readDrawnGeoJSON = () => cy.readStoreValue('state.drawing.geoJson')

    const getDrawingManager = () => cy.readWindowValue('drawingManager')

    function readDrawingFeatures(type, callback) {
        getDrawingManager()
            .then((manager) => manager.source.getFeatures())
            .then((features) => {
                expect(features).to.have.length(1)
                const foundType = features[0].getGeometry().getType()
                expect(foundType).to.equal(type)
                if (callback) callback(features)
            })
    }

    function checkGeoJsonProperty(key, expected) {
        getDrawingManager()
            .then((manager) => manager.source.getFeatures())
            .then((features) => {
                expect(features).to.have.length(1)
                const v = features[0].get(key)
                expect(v).to.equal(
                    expected,
                    `${v} != ${expected} Properties are ${JSON.stringify(
                        features[0].getProperties(),
                        null,
                        2
                    )}`
                )
            })
    }

    /**
     * This function has been taken from the OL draw spec. Simulates a browser event on the map
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

    const getDrawingMap = () => cy.readWindowValue('drawingMap')

    function clickTheMap(x, y, callback) {
        getDrawingMap().then((map) => {
            // Create a point, a geojson will appear in the store
            simulateEvent(map, 'pointermove', x, y)
            simulateEvent(map, 'pointerdown', x, y)
            simulateEvent(map, 'pointerup', x, y)
            if (callback) callback(map)
        })
    }

    function createAPoint(kind, x = 0, y = 0, xx = 915602.81, yy = 5911929.47) {
        cy.mockupBackendResponse('files', mockResponse, 'saveFile')
        cy.mockupBackendResponse('files/**', { ...mockResponse, status: 'updated' }, 'modifyFile')

        cy.goToDrawing()
        clickTool(kind)
        clickTheMap(x, y, () => {
            readDrawingFeatures('Point', (features) => {
                const coos = features[0].getGeometry().getCoordinates()
                expect(coos).to.eql([xx, yy], `bad: ${JSON.stringify(coos)}`)
            })
            cy.wait('@saveFile').then((interception) =>
                checkResponse(interception, ['Placemark'], true)
            )
        })
    }

    it('toggles the marker symbol popup when clicking button', () => {
        createAPoint('marker', 0, -200, 915602.81, 6156527.960512564)

        // Opening symbol popup (should display default iconset)
        cy.get('.marker-style').click()
        cy.get('.marker-style-popup').should('be.visible')

        cy.wait('@iconsets')
        cy.wait('@iconset_default')

        // we reduce the number of symbols to speed up the test
        Array.from(Array(19).keys()).forEach(() =>
            cy
                .wait('@icon')
                .its('request.url')
                .should('include', 'v4/iconsets/default/icon/')
                .should('include', '255,0,0.png')
        )

        // Check default color
        checkGeoJsonProperty('markerColor', '#ff0000')
        cy.get('.marker-style-popup .color-select-box > .selected > div').should(
            'have.css',
            'backgroundColor',
            'rgb(255, 0, 0)'
        )

        // Select green color
        cy.get('.marker-style-popup .color-select-box > :nth-child(4) > div').click()
        checkGeoJsonProperty('markerColor', '#008000')
        checkGeoJsonProperty(
            'icon',
            'https://service-icons.bgdi-dev.swisstopo.cloud/v4/iconsets/default/icon/bicycle-0,128,0.png'
        )
        cy.get('.marker-style-popup .color-select-box > .selected > div').should(
            'have.css',
            'backgroundColor',
            'rgb(0, 128, 0)'
        )
        Array.from(Array(19).keys()).forEach(() =>
            cy
                .wait('@icon')
                .its('request.url')
                .should('include', 'v4/iconsets/default/icon/')
                .should('include', '0,128,0.png')
        )
        cy.wait('@modifyFile').then((interception) =>
            expect(interception.request.body).to.contain(
                '<Data name="icon"><value>https://service-icons.bgdi-dev.swisstopo.cloud/v4/iconsets/default/icon/bicycle-0,128,0.png</value>'
            )
        )

        // Select another size
        checkGeoJsonProperty('markerScale', 1)
        cy.get('.marker-style-popup [data-cy="size-button"]').click()
        cy.get('.marker-style-popup [data-cy="size-choices"] > :nth-child(2)').click()
        checkGeoJsonProperty('markerScale', 1.5)
        cy.wait('@modifyFile').then((interception) =>
            expect(interception.request.body).to.contain(
                '<Data name="markerScale"><value>1.5</value>'
            )
        )

        // Select babs iconset
        cy.get('[data-cy=symbols-button]').click()
        cy.get('[data-cy=symbols-choices] > :nth-child(1)').click()
        cy.wait('@iconset_babs')

        Array.from(Array(14).keys()).forEach(() =>
            cy
                .wait('@icon')
                .its('request.url')
                .should('include', 'v4/iconsets/babs/icon/babs-')
                .should('include', '.png')
        )
        cy.get('.marker-style-popup .color-select-box').should('not.exist')
        cy.get('.marker-style-popup .marker-icon-select-box :nth-child(4) > img').click()
        checkGeoJsonProperty(
            'icon',
            'https://service-icons.bgdi-dev.swisstopo.cloud/v4/iconsets/babs/icon/babs-100.png'
        )
        cy.wait('@modifyFile').then((interception) =>
            expect(interception.request.body).to.contain(
                '<Data name="icon"><value>https://service-icons.bgdi-dev.swisstopo.cloud/v4/iconsets/babs/icon/babs-100.png</value>'
            )
        )
    })

    describe('test text popup', () => {
        ;['marker', 'text'].forEach((kind) => {
            it(`toggles the ${kind} symbol popup when clicking button`, () => {
                createAPoint(kind, 0, -200, 915602.81, 6156527.960512564)

                // Opening text popup
                cy.get('.text-style').click()
                cy.get('.text-style-popup').should('be.visible')

                cy.get('.text-style-popup [data-cy=size-button]').click()
                cy.get('.text-style-popup [data-cy=size-choices] > a:nth-child(2)').click()
                checkGeoJsonProperty('textScale', 1.5)

                cy.get('.text-style-popup .color-select-box > div:nth-child(1)').click()
                checkGeoJsonProperty('color', '#000000')

                // Closing the popup
                cy.get('.text-style').click()
                cy.get('.text-style-popup').should('not.exist')

                // Opening again the popup
                cy.get('.text-style').click()
                cy.get('.text-style-popup').should('be.visible')
            })
        })
    })

    it('moves a marker', () => {
        createAPoint('marker')
        getDrawingMap().then((map) => {
            // Move it, the geojson geometry should move
            simulateEvent(map, 'pointerdown', 0, 0)
            simulateEvent(map, 'pointermove', 200, 140)
            simulateEvent(map, 'pointerdrag', 200, 140)
            simulateEvent(map, 'pointerup', 200, 140)
            readDrawingFeatures('Point', (features) => {
                const coos = features[0].getGeometry().getCoordinates()
                expect(coos).to.eql(
                    [1160201.300512564, 5740710.526641205],
                    `bad: ${JSON.stringify(coos)}`
                )
            })
        })

        cy.get('#text').type('This is a title')
        checkGeoJsonProperty('text', 'This is a title')

        cy.get('#description').type('This is a description')
        checkGeoJsonProperty('description', 'This is a description')

        cy.get('.btn-close').click()
        readDrawnGeoJSON().then((geojson) => {
            const g0 = geojson.features[0].geometry
            expect(g0.type).to.equal('Point')
            const coos = g0.coordinates
            expect(coos).to.eql(
                [10.42226560905782, 45.7520927843664],
                `bad: ${JSON.stringify(coos)}`
            )
        })
    })

    it('creates a text', () => {
        createAPoint('text', 0, -200, 915602.81, 6156527.960512564)
    })

    it('creates a polygon by re-clicking first point', () => {
        cy.mockupBackendResponse('files', mockResponse, 'saveFile')
        cy.goToDrawing()
        clickTool('line')
        cy.get(olSelector).click(100, 100)
        cy.get(olSelector).click(150, 100)
        cy.get(olSelector).click(150, 150)
        cy.get(olSelector).click(100, 100)
        readDrawingFeatures('Polygon')
        cy.wait('@saveFile').then((interception) =>
            checkResponse(interception, ['LINE', '<Data name="color"><value>#ff0000</value>'], true)
        )
    })

    it('changes color of line/ polygon', () => {
        cy.mockupBackendResponse('files', mockResponse, 'saveFile')
        cy.mockupBackendResponse('files/**', { ...mockResponse, status: 'updated' }, 'modifyFile')
        cy.goToDrawing()
        clickTool('line')
        cy.get(olSelector).click(100, 100)
        cy.get(olSelector).click(150, 100)
        cy.get(olSelector).click(150, 150)
        cy.get(olSelector).click(100, 100)
        readDrawingFeatures('Polygon')
        cy.wait('@saveFile').then((interception) =>
            checkResponse(interception, ['LINE', '<Data name="color"><value>#ff0000</value>'], true)
        )

        // Opening line popup
        cy.get('.line-style').click()
        cy.get('.line-style-popup').should('be.visible')

        cy.get('.line-style-popup .color-select-box > div:nth-child(1)').click()
        checkGeoJsonProperty('color', '#000000')
        cy.wait('@modifyFile').then((interception) =>
            expect(interception.request.body).to.contain(
                '<Data name="color"><value>#000000</value>'
            )
        )
    })

    it('creates a line with double click', () => {
        cy.goToDrawing()
        clickTool('line')
        cy.get(olSelector).click(100, 100)
        cy.get(olSelector).click(150, 150)
        cy.get(olSelector).dblclick(120, 240)
        readDrawingFeatures('LineString', (features) => {
            const coos = features[0].getGeometry().getCoordinates()
            expect(coos.length).to.equal(3)
        })
        cy.get(olSelector).click(500, 500) // do nothing, already finished
        readDrawingFeatures('LineString', (features) => {
            const coos = features[0].getGeometry().getCoordinates()
            expect(coos.length).to.equal(3)
        })
    })

    const checkResponse = (interception, data, create = false) => {
        if (!create) {
            const urlArray = interception.request.url.split('/')
            const id = urlArray[urlArray.length - 1]
            expect(id).to.be.eq(mockResponse.adminId)
        }
        expect(interception.request.headers['content-type']).to.be.eq(
            'application/vnd.google-earth.kml+xml'
        )
        expect(interception.request.body).to.contain('</kml>')
        data.forEach((text) => expect(interception.request.body).to.contain(text))
    }

    it('saves a KML on draw end', () => {
        cy.mockupBackendResponse('files', mockResponse, 'saveFile')
        cy.mockupBackendResponse('files/**', { ...mockResponse, status: 'updated' }, 'modifyFile')

        cy.goToDrawing()
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
