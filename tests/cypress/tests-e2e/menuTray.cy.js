const height = Cypress.config('viewportHeight')

const menuTraySelector = '[data-cy="menu-tray"]'
const menuTopicSectionSelector = '[data-cy="menu-topic-section"]'
const menuTopicHeaderSelector = menuTopicSectionSelector + ' > [data-cy="menu-section-header"]'
const menuActiveLayersSectionSelector = '[data-cy="menu-active-layers"]'
const menuActiveLayersHeaderSelector =
    menuActiveLayersSectionSelector + ' > [data-cy="menu-section-header"]'
const menuHelpSectionHeader = '[data-cy="menu-help-section"] > [data-cy="menu-section-header"]'
const menuShareHeaderSelector = '[data-cy="menu-share-section"] > [data-cy="menu-section-header"]'

function getFakeWMTSLayerCatalogEntry(id) {
    return {
        category: 'layer',
        id: id,
        label: `Fake WMTS layer ${id}`,
        layerBodId: 'test.wmts.layer.' + id,
        staging: 'prod',
    }
}

function addFakeWMTSLayer(layers, id) {
    const layerName = 'test.wmts.layer.' + id
    layers[layerName] = {
        opacity: 1.0,
        attribution: 'attribution.test.wmts.layer',
        background: false,
        searchable: true,
        format: 'png',
        queryableAttributes: ['id', 'name'],
        topics: 'ech,test-topic-standard,test-topic-with-active-and-visible-layers',
        attributionUrl: 'https://api3.geo.admin.ch/',
        tooltip: true,
        timeEnabled: false,
        highlightable: true,
        chargeable: false,
        timestamps: ['current'],
        hasLegend: true,
        label: 'WMTS test layer ' + id,
        type: 'wmts',
        serverLayerName: 'test.wmts.layer.' + id,
    }
    return layers
}

function getFixturesAndIntercepts(nbLayers, nbSelectedLayers) {
    const topicId = 'ech'
    return {
        addCatalogFixtureAndIntercept: () => {
            let layersCatalogEntries = []
            for (let i = 2; i < nbLayers + 2; i++) {
                layersCatalogEntries = layersCatalogEntries.concat(getFakeWMTSLayerCatalogEntry(i))
            }
            const catalog = {
                results: {
                    root: {
                        category: 'root',
                        staging: 'prod',
                        id: 1,
                        children: layersCatalogEntries,
                    },
                },
            }
            // intercepting further topic metadata retrieval. Each topic has its own topic tree
            cy.intercept(`**/rest/services/${topicId}/CatalogServer?lang=**`, {
                body: catalog,
            }).as(`topic-${topicId}`)
        },
        addLayerFixtureAndIntercept: () => {
            let layers = {}
            for (let i = 2; i < nbLayers + 2; i++) {
                addFakeWMTSLayer(layers, i)
            }
            cy.intercept('**/rest/services/all/MapServer/layersConfig**', {
                body: layers,
            }).as('layers')
        },
        addTopicFixtureAndIntercept: () => {
            let activatedLayers = []
            for (let i = 2; i < nbSelectedLayers + 2; i++) {
                activatedLayers.push('test.wmts.layer.' + i)
            }
            cy.intercept('**/rest/services', {
                body: {
                    topics: [
                        {
                            activatedLayers,
                            backgroundLayers: ['test.background.layer', 'test.background.layer2'],
                            defaultBackground: 'test.background.layer2',
                            groupId: 1,
                            id: topicId,
                            plConfig: null,
                            selectedLayers: [],
                        },
                    ],
                },
            }).as('topics')
        },
    }
}

/**
 * Check that the menu is less or equal than its maximal allowed size
 *
 * @param {any} shouldHaveMaxSize Wheather or not the menu should have attained its maximal size
 */
function measureMenu(shouldHaveMaxSize) {
    cy.get(menuTraySelector)
        .then((elems) => elems[0].getBoundingClientRect().bottom)
        .as('menuTrayBottom')

    cy.get('@expectedMenuTrayBottom').then((expectedMenuTrayBottom) => {
        if (shouldHaveMaxSize) {
            cy.get('@menuTrayBottom').should('be.equal', expectedMenuTrayBottom)
        } else {
            cy.get('@menuTrayBottom').should('be.lte', expectedMenuTrayBottom)
        }
    })
}

/**
 * Initializes the app with the specified amount of menu items, then initialize the test
 *
 * @param {any} nbLayers Number of menu items in the topics list
 * @param {any} nbSelectedLayers Number of menu items in the active layers list
 */
function init(nbLayers, nbSelectedLayers) {
    cy.goToMapView({}, false, {}, getFixturesAndIntercepts(nbLayers, nbSelectedLayers))
    cy.readStoreValue('getters')
        .as('storeGetters')
        .then((getters) => {
            if (getters.isPhoneMode) {
                cy.get('[data-cy="menu-button"]').click()
                cy.wrap(height).as('expectedMenuTrayBottom')
            } else if (getters.isTabletSize) {
                cy.get('[data-cy="menu-button"]').click()
                cy.wrap(height - 70).as('expectedMenuTrayBottom')
            } else {
                cy.wrap(height - 70).as('expectedMenuTrayBottom')
            }
            cy.get(menuTopicHeaderSelector).click()
            waitForAnimationsToFinish()
        })
}

function waitForAnimationsToFinish() {
    // animations last 0.2s
    cy.wait(200) // eslint-disable-line cypress/no-unnecessary-waiting
}

/**
 * Check that only the specified sections are open.
 *
 * @param {[String]} openSections An array listening all open sections
 */
function checkOpenSections(openSections) {
    const sections = [
        { name: 'topics', selector: '[data-cy="menu-topic-tree"]' },
        { name: 'activeLayers', selector: '[data-cy="menu-section-active-layers"]' },
        { name: 'help', selector: '[data-cy="menu-help-content"]' },
        {
            name: 'share',
            selector: '[data-cy="menu-share-section"] > [data-cy="menu-section-body"]',
        },
    ]
    sections
        .filter((section) => openSections.includes(section.name))
        .forEach((section) => {
            cy.get(section.selector).should('be.visible')
        })
    sections
        .filter((section) => !openSections.includes(section.name))
        .forEach((section) => cy.get(section.selector).should('be.hidden'))
}

/**
 * Check whether or not scrollbars are visible
 *
 * @param {any} topicsScrollable Should the scrollbar of the topcis section be visible?
 * @param {any} activeLayersScrollable Should the scrollbar of the active layers section be visible?
 */
function checkScrollbarVisibility(topicsScrollable, activeLayersScrollable) {
    let topicSectionOriginalHeight
    cy.get('[data-cy="menu-topic-tree"]')
        .then((elems) => {
            topicSectionOriginalHeight = elems[0].clientHeight
            return elems
        })
        .parents('[data-cy="menu-section-body"]')
        .should((elems) => {
            const clientHeight = elems[0].clientHeight
            if (topicsScrollable) {
                expect(clientHeight).to.be.lt(topicSectionOriginalHeight)
            } else {
                expect(clientHeight).to.be.eq(topicSectionOriginalHeight)
            }
        })
    let activeSectionOriginalHeight
    cy.get('[data-cy="menu-section-active-layers"]')
        .then((elems) => {
            activeSectionOriginalHeight = elems[0].clientHeight
            return elems
        })
        .parents('[data-cy="menu-section-body"]')
        .should((elems) => {
            const clientHeight = elems[0].clientHeight
            if (activeLayersScrollable) {
                expect(clientHeight).to.be.lt(activeSectionOriginalHeight)
            } else {
                expect(clientHeight).to.be.eq(activeSectionOriginalHeight)
            }
        })
}

describe('Test menu tray ui', () => {
    it('check correct sizing of menu and autoclosing of menu sections', function () {
        init(30, 30)
        checkOpenSections(['topics', 'activeLayers'])
        measureMenu(true)
        checkScrollbarVisibility(true, true)

        cy.get(menuActiveLayersHeaderSelector).click()
        waitForAnimationsToFinish()
        checkOpenSections(['topics'])
        measureMenu(true)

        cy.get(menuTopicHeaderSelector).click()
        waitForAnimationsToFinish()
        checkOpenSections([])
        measureMenu(false)

        cy.get(menuActiveLayersHeaderSelector).click()
        waitForAnimationsToFinish()
        checkOpenSections(['activeLayers'])
        measureMenu(true)

        cy.get(menuHelpSectionHeader).click()
        waitForAnimationsToFinish()
        checkOpenSections(['help'])
        measureMenu(false)

        cy.get(menuShareHeaderSelector).click()
        waitForAnimationsToFinish()
        checkOpenSections(['share'])
        measureMenu(false)

        cy.get(menuTopicHeaderSelector).click()
        waitForAnimationsToFinish()
        checkOpenSections(['topics'])
        measureMenu(true)
    })
    it('Each open menu section has a minimal height, even if there is a high discrepancy between their original heights', () => {
        init(30, 2)
        checkOpenSections(['topics', 'activeLayers'])
        measureMenu(true)
        checkScrollbarVisibility(true, false)
    })
    it('no scrolling if menus are small enough', () => {
        init(3, 2)
        checkOpenSections(['topics', 'activeLayers'])
        measureMenu(false)
        checkScrollbarVisibility(false, false)
    })
})
