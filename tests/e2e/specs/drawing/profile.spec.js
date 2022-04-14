const olSelector = '.ol-viewport'

const testResponse = [
    {
        dist: 0.0,
        alts: { DTM2: 1341.7, COMB: 1341.7, DTM25: 1341.7 },
        easting: 2704280.989,
        northing: 1170235.988,
    },
    {
        dist: 2.5,
        alts: { DTM2: 1341.8, COMB: 1341.8, DTM25: 1341.8 },
        easting: 2704283.24,
        northing: 1170234.979,
    },
    {
        dist: 3.0,
        alts: { DTM2: 1341.8, COMB: 1341.8, DTM25: 1341.8 },
        easting: 2704283.769,
        northing: 1170234.741,
    },

    {
        dist: 4.5,
        alts: { DTM2: 1341.7, COMB: 1341.7, DTM25: 1341.7 },
        easting: 2704285.137,
        northing: 1170234.128,
    },
]
const testInfo = ['0.00m', '0.10m', '0.10m', "1'342m", "1'342m", '4.50m', '4.51m']

describe('Profile popup', () => {
    context('check how app behave with backend output', () => {
        const goToDrawingWithMockProfile = (mockValue) => {
            cy.mockupBackendResponse('rest/services/profile.json', mockValue, 'profile')
            cy.goToDrawing()
            cy.clickDrawingTool('LINEPOLYGON')
            cy.get(olSelector).click(100, 200)
            cy.get(olSelector).click(150, 200)
            cy.get(olSelector).dblclick(120, 240)
            cy.get('[data-cy="profile-popup"]').should('be.visible')
            cy.wait('@profile')
        }
        it('test empty profile', () => {
            goToDrawingWithMockProfile([])
            for (let i = 1; i < 8; i++) {
                cy.get(
                    `[data-cy="profile-popup-info-container"] > :nth-child(${i}) [data-cy="profile-popup-info"]`
                ).should('have.text', '0.00m')
            }
            cy.get('[data-cy="profile-popup-area"]').should('not.have.attr', 'd')
            cy.get('[data-cy="profile-popup-delete-button"]').click()
            cy.get('[data-cy="profile-popup"]').should('not.exist')
            cy.get('[data-cy="drawing-style-popup"]').should('not.exist')
        })
        it('test valid profile', () => {
            goToDrawingWithMockProfile(testResponse)
            testInfo.forEach((value, index) => {
                const elementIndex = index + 1
                cy.get(
                    `[data-cy="profile-popup-info-container"] > :nth-child(${elementIndex}) [data-cy="profile-popup-info"]`
                ).should('have.text', value)
            })
            cy.get('[data-cy="profile-popup-area"]').should('have.attr', 'd')
            cy.get('[data-cy="profile-popup-area"]')
                .trigger('mouseover')
                .trigger('mousemove', 'center')
            cy.get('[data-cy="profile-popup-tooltip"]').should('be.visible')
            cy.get('[data-cy="profile-popup-tooltip"] .distance').should('have.text', '2.25 m')
            cy.get('[data-cy="profile-popup-tooltip"] .elevation').should('have.text', '1341.79 m')
        })
    })
    context('show/minimize/close profile popup', () => {
        beforeEach(() => {
            cy.mockupBackendResponse('rest/services/profile.json', testResponse, 'profile')
            cy.goToDrawing()
            cy.clickDrawingTool('LINEPOLYGON')
            cy.get(olSelector).click(100, 200)
            cy.get(olSelector).click(150, 200)
            cy.get(olSelector).click(120, 240)
            cy.get(olSelector).click(100, 200)
        })
        it('minimizes the profile popup when clicking on the header', () => {
            cy.get('[data-cy="profile-popup"]').should('be.visible')
            cy.get('[data-cy="profile-popup-content"]').should('be.visible')
            cy.get('[data-cy="profile-popup-header"]').click()
            cy.get('[data-cy="profile-popup"]').should('be.visible')
            cy.get('[data-cy="profile-popup-content"]').should('not.exist')
        })
        it('minimizes the profile popup when click on the minimize button', () => {
            cy.get('[data-cy="profile-popup"]').should('be.visible')
            cy.get('[data-cy="profile-popup-content"]').should('be.visible')
            cy.get('[data-cy="profile-popup-minimize-button"]').click()
            cy.get('[data-cy="profile-popup"]').should('be.visible')
            cy.get('[data-cy="profile-popup-content"]').should('not.exist')
            // the style popup should still be open
            cy.get('[data-cy="drawing-style-popup"]').should('be.visible')
        })
        it('shows the popup again (maximized) when clicking on the header while minimized', () => {
            cy.get('[data-cy="profile-popup-header"]').click().click()
            cy.get('[data-cy="profile-popup"]').should('be.visible')
            cy.get('[data-cy="profile-popup-content"]').should('be.visible')
        })
        it('closes the profile popup when the user clicks somewhere else on the map', () => {
            cy.get(olSelector).click(360, 210)
            cy.get('[data-cy="profile-popup"]').should('not.exist')
            cy.get('[data-cy="profile-popup-content"]').should('not.exist')
            cy.get(olSelector).click(120, 240)
            cy.get('[data-cy="profile-popup"]').should('be.visible')
        })
        it('opens up the popup again if the user clicks on the feature', () => {
            cy.get(olSelector).click(360, 210)
            cy.get(olSelector).click(120, 240)
            cy.get('[data-cy="profile-popup"]').should('be.visible')
            cy.get('[data-cy="profile-popup-content"]').should('be.visible')
        })
        it('closes the profile popup when click on the X button', () => {
            cy.get('[data-cy="profile-popup-close-button"]').click()
            cy.get('[data-cy="profile-popup"]').should('not.exist')
            cy.get('[data-cy="drawing-style-popup"]').should('not.exist')
        })
        it('closes the profile popup, while minimized, when the user clicks on the X button', () => {
            cy.get('[data-cy="profile-popup-minimize-button"]').click()
            // TODO: find a way to place the profile popup's close button out of the layers copyrights (and then remove the { force: true })
            // see : https://jira.swisstopo.ch/browse/BGDIINF_SB-2170
            cy.get('[data-cy="profile-popup-close-button"]').click({ force: true })
            cy.get('[data-cy="profile-popup-header"]').should('not.exist')
            cy.get('[data-cy="drawing-style-popup"]').should('not.exist')
        })
    })
})
