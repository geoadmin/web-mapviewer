describe('Zoom level is read from the URL', () => {

    it('is deactivated for now because we need to rewrite the URL/state plugin', () => {
        cy.visit('/');
    });
    // const startingZoomLevel = 11;
    // const readZoomLevel = () => cy.window().its('store.state.position.zoom');
    //
    // beforeEach(() => {
    //     cy.visit(`/?zoom=${startingZoomLevel}`);
    // });
    //
    // it('Reads zoom level from the URL', () => {
    //     readZoomLevel().should('eq', startingZoomLevel);
    //     const anotherZoomLevel = 5;
    //     cy.visit(`/?zoom=${anotherZoomLevel}`);
    //     readZoomLevel().should('eq', anotherZoomLevel);
    // });
    //
    // it('Adds zoom level to the URL', () => {
    //     cy.url().should('contain', `zoom=${startingZoomLevel}`);
    //     cy.get('[data-cy="zoom-in"]').click();
    //     cy.url().should('contain', `zoom=${startingZoomLevel + 1}`);
    // });
    //
    // it('Will zoom the map when zoom button is clicked', () => {
    //     readZoomLevel().should('eq', startingZoomLevel);
    //     cy.get('[data-cy="zoom-in"]').click();
    //     readZoomLevel().should('eq', startingZoomLevel + 1);
    //     cy.get('[data-cy="zoom-out"]').click();
    //     readZoomLevel().should('eq', startingZoomLevel);
    // });
});
