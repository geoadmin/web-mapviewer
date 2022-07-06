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
        expect(content).to.contains(`<value>${type}</value>`)
    })
    expect(content).to.contains('<value>new text</value>')
    expect(content).to.contains('/icons/001-marker@1x-255,0,0.png')
}
const checkGpxFile = (content) => {
    ;['Polygon', 'Point'].forEach((type) => {
        expect(content).to.contains(`<type>${type}</type>`)
    })
}

const csvMock =
    '"Distance";"Altitude";"Easting";"Northing"\n' +
    '"0";"940.7";"2620888.741";"1196773.17"\n' +
    '"22.4";"941.7";"2620886.135";"1196750.875"'

const checkCsvFile = (content) => {
    expect(content).to.be.equal(csvMock)
}

describe('Drawing toolbox actions', () => {
    beforeEach(() => {
        cy.task('clearFolder', downloadsFolder)
        cy.goToDrawing()
        cy.drawGeoms()
    })
    context('Export KML', () => {
        it('exports KML when clicking on the export button (without choosing format)', () => {
            cy.get('[data-cy="drawing-toolbox-quick-export-button"]').click()
            checkFiles('kml', checkKmlFile)
        })
        it('exports KML file through the "choose format" export menu', () => {
            cy.get('[data-cy="drawing-toolbox-choose-export-format-button"]').click()
            cy.get('[data-cy="drawing-toolbox-export-kml-button"]').click()
            checkFiles('kml', checkKmlFile)
        })
    })
    context('Export GPX', () => {
        it('exports GPX file through the "choose format" export menu', () => {
            cy.get('[data-cy="drawing-toolbox-choose-export-format-button"]').click()
            cy.get('[data-cy="drawing-toolbox-export-gpx-button"]').click()
            checkFiles('gpx', checkGpxFile)
        })
    })
})

describe('Profile popup actions', () => {
    beforeEach(() => {
        cy.task('clearFolder', downloadsFolder)
        cy.goToDrawing()
        cy.drawMeasure()
    })
    it('trigger download of CSV file', () => {
        cy.mockupBackendResponse('rest/services/profile.csv**', csvMock, 'profileAsCsv')
        cy.get('[data-cy="profile-popup-csv-download-button"]').click()
        checkFiles('csv', checkCsvFile)
        cy.wait('@profileAsCsv')
    })
})
