describe('Profile', () => {
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
    const testInfo = [' 0.00m ', ' 0.10m ', ' 0.10m ', " 1'342m ", " 1'342m ", ' 4.50m ', ' 4.51m ']

    it('test empty profile', () => {
        cy.mockupBackendResponse('rest/services/profile.json', [], 'emptyProfile')
        cy.goToDrawing()
        cy.clickDrawingTool('line')
        cy.get(olSelector).click(100, 100)
        cy.get(olSelector).click(150, 150)
        cy.get(olSelector).dblclick(120, 240)
        cy.get('.card.profile-popup').should('be.visible')
        for (let i = 1; i < 8; i++) {
            cy.get(
                `div.ga-wrapper > div:nth-child(${i}) > div:nth-child(${i === 6 ? 3 : 2})`
            ).should('have.text', ' 0.00m ')
        }
        cy.get('.ga-profile-area').should('not.have.attr', 'd')
        cy.get('.card-body > .delete-btn').click()
        cy.get('.card.profile-popup').should('not.exist')
        cy.get('.drawing-style-popup').should('not.exist')
    })

    it('test line profile', () => {
        cy.mockupBackendResponse('rest/services/profile.json', testResponse, 'profile')
        cy.goToDrawing()
        cy.clickDrawingTool('line')
        cy.get(olSelector).click(100, 100)
        cy.get(olSelector).click(150, 150)
        cy.get(olSelector).dblclick(120, 240)
        cy.get('.card.profile-popup').should('be.visible')
        testInfo.forEach((value, indx) => {
            const elementIndx = indx + 1
            cy.get(
                `div.ga-wrapper > div:nth-child(${elementIndx}) > div:nth-child(${
                    elementIndx === 6 ? 3 : 2
                })`
            ).should('have.text', value)
        })
        cy.get('.ga-profile-area').should('have.attr', 'd')
        cy.get('.ga-profile-area').trigger('mouseover')
        cy.get('.ga-profile-area').trigger('mousemove', 'center')
        cy.get('.ga-profile-tooltip').should('be.visible')
        cy.get('.ga-profile-tooltip .distance').should('have.text', '2.25 m')
        cy.get('.ga-profile-tooltip .elevation').should('have.text', '1341.79 m')
    })

    it('test open/hide profile (polygon)', () => {
        const isProfileVisible = () => {
            cy.get('.card.profile-popup').should('be.visible')
            cy.get('.ga-profile-area').should('have.attr', 'd')
        }
        cy.mockupBackendResponse('rest/services/profile.json', testResponse, 'profile')
        cy.goToDrawing()
        cy.clickDrawingTool('line')
        cy.get(olSelector).click(100, 100)
        cy.get(olSelector).click(150, 150)
        cy.get(olSelector).click(120, 240)
        cy.get(olSelector).click(100, 100)
        isProfileVisible()
        cy.get(olSelector).click(360, 160)
        cy.get('.card.profile-popup').should('not.exist')
        cy.get(olSelector).click(120, 240)
        isProfileVisible()
        cy.get('.card.profile-popup .card-header .fa-times').click()
        cy.get('.card.profile-popup').should('not.exist')
        cy.get('.drawing-style-popup').should('not.exist')
        cy.get(olSelector).click(120, 240)
        isProfileVisible()
        cy.get('.profile-popup .card-header .fa-minus').click()
        cy.get('.card.reduced-popup').should('be.visible')
        cy.get('.drawing-style-popup').should('be.visible')
        cy.get('.card.profile-popup').should('not.exist')
        cy.get('.reduced-popup').click()
        isProfileVisible()
        cy.get('.profile-popup .card-header .fa-minus').click()
        cy.get('.reduced-popup .card-header .fa-times').click()
        cy.get('.reduced-popup').should('not.exist')
        cy.get('.drawing-style-popup').should('not.exist')
    })
})
