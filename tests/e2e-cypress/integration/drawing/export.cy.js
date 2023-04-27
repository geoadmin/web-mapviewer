/// <reference types="cypress" />

import { EditableFeatureTypes } from '@/api/features.api'
import { recurse } from 'cypress-recurse'

const downloadsFolder = Cypress.config('downloadsFolder')

const isNonEmptyArray = (value) => {
    return Array.isArray(value) && value.length > 0
}

const checkFiles = (extension, callback) => {
    recurse(
        () => cy.task('findFiles', { folderName: downloadsFolder, extension }),
        isNonEmptyArray,
        { delay: 100 }
    ).then((files) => {
        const fileName = `${downloadsFolder}/${files[files.length - 1]}`
        expect(fileName).to.contains(`map.geo.admin.ch_${extension.toUpperCase()}_`)
        cy.readFile(fileName).should('have.length.gt', 50).then(callback)
    })
}

const checkKmlFile = (content) => {
    Object.values(EditableFeatureTypes).forEach((type) => {
        expect(content).to.contains(`"featureType":"${type}"`)
    })
    expect(content).to.contains('"title":"New text"')
    expect(content).to.contains('"name":"001-marker"')
}
const checkGpxFile = (content) => {
    //2 <rte> (routes), one for LINEPOLYGON and MEASURE
    expect(content).to.match(/<gpx.*<rte>.*<\/rte>.*<rte>.*<\/rte>.*<\/gpx>/)
    expect(content).to.not.match(/<gpx.*<rte>.*<\/rte>.*<rte>.*<\/rte>.*<rte>.*<\/rte>.*<\/gpx>/)
    //2 <wpt> (Waypoints), one for MAKER and ANNOTATION
    expect(content).to.match(/<gpx.*<wpt.*\/>.*<wpt.*\/>.*<\/gpx>/)
    expect(content).to.not.match(/<gpx.*<wpt.*\/>.*<wpt.*\/>.*<wpt.*\/>.*<\/gpx>/)
}

describe('Drawing toolbox actions', () => {
    beforeEach(() => {
        cy.task('clearFolder', downloadsFolder)
        cy.goToDrawing()
        cy.drawGeoms()
    })
    context('Export KML', () => {
        it('exports KML when clicking on the export button (without choosing format)', () => {
            cy.get(
                '[data-cy="drawing-toolbox-export-button"] [data-cy="dropdown-main-button"]'
            ).click()
            checkFiles('kml', checkKmlFile)
        })
        it('exports KML file through the "choose format" export menu', () => {
            cy.get(
                '[data-cy="drawing-toolbox-export-button"] [data-cy="dropdown-toggle-button"]'
            ).click()
            cy.get(
                '[data-cy="drawing-toolbox-export-button"] [data-cy="dropdown-item-kml"]'
            ).click()
            checkFiles('kml', checkKmlFile)
        })
    })
    context('Export GPX', () => {
        it('exports GPX file through the "choose format" export menu', () => {
            cy.get(
                '[data-cy="drawing-toolbox-export-button"] [data-cy="dropdown-toggle-button"]'
            ).click()
            cy.get(
                '[data-cy="drawing-toolbox-export-button"] [data-cy="dropdown-item-gpx"]'
            ).click()
            checkFiles('gpx', checkGpxFile)
        })
    })
})

describe('Profile popup actions', () => {
    it('trigger download of CSV file', () => {
        cy.task('clearFolder', downloadsFolder)
        // drawing a measure line
        cy.goToDrawing()
        cy.addProfileJsonFixture()
        cy.drawMeasure()
        // waiting for service-alti backend
        cy.wait('@profile')
        // preparing the CSV request intercept
        cy.intercept('**/rest/services/profile.csv**', {
            fixture: 'service-alti/profile.fixture.csv',
        }).as('profileAsCsv')
        // triggering a CSV download
        cy.get('[data-cy="profile-popup-csv-download-button"]').click()
        // check CSV content
        cy.fixture('service-alti/profile.fixture.csv').then((mockCsv) => {
            checkFiles('csv', (content) => {
                // just in case we are testing from windows we replace all \r\n by \n
                const agnosticContent = content.replaceAll('\r', '')
                const agnosticMockCsv = mockCsv.replaceAll('\r', '')
                expect(agnosticContent).to.be.equal(agnosticMockCsv)
            })
        })
    })
})
