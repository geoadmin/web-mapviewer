/// <reference types="cypress" />

const olSelector = '.ol-viewport'

const testInfo = ['0.00m', '0.10m', '0.10m', "1'342m", "1'342m", '4.50m', '4.51m']

describe('Profile popup', () => {
    const goToDrawingWithMockProfile = (mockValue) => {
        cy.goToDrawing()
        cy.addProfileJsonFixture(mockValue)
        cy.clickDrawingTool('MEASURE')
        cy.get(olSelector).click(100, 200)
        cy.get(olSelector).click(150, 200)
        cy.get(olSelector).dblclick(120, 240)
        cy.get('[data-cy="profile-popup-content"]').should('be.visible')
        cy.wait('@profile')
    }
    context('Validate correctness of data passed to the backend', () => {
        beforeEach(() => {
            // Interception to validate the backend response
            cy.intercept(
                {
                    method: 'POST',
                    url: `**/rest/services/profile.json**`,
                },
                async (req) => {
                    expect(typeof req.body).to.be.equal('object')
                    expect(Array.isArray(req.body.coordinates)).to.be.true
                    expect(req.body.coordinates).to.have.length.of.at.least(2)
                    req.body.coordinates.forEach((coord) => {
                        expect(Array.isArray(coord)).to.be.true
                        expect(coord).to.have.length(2)
                        expect(typeof coord[0]).to.be.equal('number')
                        expect(typeof coord[1]).to.be.equal('number')
                    })
                    req.reply({
                        statusCode: 200,
                        body: testResponse,
                    })
                }
            ).as('profile')
            cy.goToDrawing()
            cy.clickDrawingTool('MEASURE')
            cy.get(olSelector).click(100, 200)
            cy.get(olSelector).click(150, 200)
        })
        it('Test data passed when drawing a LineString', () => {
            cy.get(olSelector).dblclick(120, 240)
            cy.wait('@profile')
        })
        it('Test data passed when drawing a closed polygon', () => {
            cy.get(olSelector).click(120, 240)
            cy.get(olSelector).dblclick(100, 200)
            cy.wait('@profile')
        })
    })
    context('check how app behave with backend output', () => {
        context('empty profile', () => {
            beforeEach(() => {
                goToDrawingWithMockProfile([])
            })
            it('has 0 as values in profile info', () => {
                for (let i = 1; i < 8; i++) {
                    cy.get(
                        `[data-cy="profile-popup-info-container"] > :nth-child(${i}) [data-cy="profile-popup-info"]`
                    ).should('have.text', '0.00m')
                }
                cy.get('[data-cy="profile-popup-area"]').should('not.have.attr', 'd')
            })
            it('has a functioning delete button', () => {
                // Delete is currently not implemented. Will be added in a later commit.
                cy.get('[data-cy="profile-popup-delete-button"]').click()
                cy.get('[data-cy="profile-popup-content"]').should('not.exist')
                cy.get('[data-cy="drawing-style-popup"]').should('not.exist')
            })
            it('does not show the profile graph', () => {
                cy.get('[data-cy="profile-popup-graph"]').should('be.hidden')
            })
        })

        it('test valid profile', () => {
            goToDrawingWithMockProfile()
            testInfo.forEach((value, index) => {
                const elementIndex = index + 1
                cy.get(
                    `[data-cy="profile-popup-info-container"] > :nth-child(${elementIndex}) [data-cy="profile-popup-info"]`
                ).should('have.text', value)
            })
            cy.get('[data-cy="profile-popup-area"]')
                .trigger('mouseover')
                .trigger('mousemove', 'center')
            // Is not 2.25m probably because of trunking and rounding error?
            cy.get('[data-cy="profile-popup-tooltip"] .distance')
                .invoke('text')
                .should('be.oneOf', ['2.25 m', '2.24 m'])
            cy.get('[data-cy="profile-popup-tooltip"] .elevation').should('have.text', '1341.79 m')
        })
    })
    context('show/minimize/close profile popup', () => {
        beforeEach(() => {
            goToDrawingWithMockProfile()
        })
        it('minimizes and restores the profile popup when clicking on the header', () => {
            cy.get('[data-cy="infobox-header"]').should('be.visible')
            cy.get('[data-cy="infobox-content"]').should('be.visible')

            cy.get('[data-cy="infobox-header"]').click()
            cy.get('[data-cy="infobox-header"]').should('be.visible')
            cy.get('[data-cy="infobox-content"]').should('not.be.visible')

            cy.get('[data-cy="infobox-header"]').click()
            cy.get('[data-cy="infobox-header"]').should('be.visible')
            cy.get('[data-cy="infobox-content"]').should('be.visible')
        })
        it('closes the popup when clicking elsewhere on the map', () => {
            cy.get(olSelector).click()
            cy.get('[data-cy="infobox"]').should('not.be.visible')
        })
        it('opens up the popup again if the user clicks on the feature', () => {
            cy.get('[data-cy="infobox-close"]').click()
            cy.get(olSelector).then(($map) => {
                let center = $map.outerWidth() / 2
                cy.get(olSelector).click(150, 200)
                cy.get('[data-cy="infobox"]').should('be.visible')
            })
        })
        it('closes the profile popup when click on the X button', () => {
            cy.get('[data-cy="infobox-close"]').click()
            cy.get('[data-cy="infobox"]').should('not.be.visible')
        })
        it('closes the profile popup, while minimized, when the user clicks on the X button', () => {
            cy.get('[data-cy="infobox-header"]').click()
            cy.get('[data-cy="infobox-close"]').click()
            cy.get('[data-cy="infobox"]').should('not.be.visible')
        })
    })
})
