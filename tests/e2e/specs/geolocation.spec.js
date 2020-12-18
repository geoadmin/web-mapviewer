/// <reference types="cypress" />

const geolocationButtonSelector = '[data-cy="geolocation-button"]';

describe('Test geolocation when geolocation is authorized', {
    env: {
        browserPermissions: {
            geolocation: "allow",
        },
    }
}, () => {

    beforeEach(() => {
        cy.goToMapView();
    })

    it('can find the geolocation button in the UI', () => {
        cy.get(geolocationButtonSelector).should('be.visible');
    })

    it('Prompt the user to authorize geolocation when the geolocation button is clicked for the first time', () => {

    })
})

describe('Test geolocation when geolocation is unauthorized', {
    env: {
        browserPermissions: {
            geolocation: "block",
        },
    }
}, () => {

    beforeEach(() => {
        cy.goToMapView();
    })

    it('shows an alert telling the user geolocation is unauthorized when the geolocation button is clicked', () => {
        cy.get(geolocationButtonSelector).click();
        cy.on('window:alert',(txt)=>{
            expect(txt).to.contains('The acquisition of the position failed because your browser settings does not allow it. Allow your browser /this website to use your location. Deactivate the "private" mode of your browser');
        })
    })

})
