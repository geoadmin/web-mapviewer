import { assertDefined } from 'support/utils'

import useUIStore from '@/store/modules/ui'

const height = Cypress.config('viewportHeight')

const menuTraySelector = '[data-cy="menu-tray"]'
const menuTopicSectionSelector = '[data-cy="menu-topic-section"]'
const menuTopicHeaderSelector = menuTopicSectionSelector + ' > [data-cy="menu-section-header"]'
const menuActiveLayersSectionSelector = '[data-cy="menu-active-layers"]'
const menuActiveLayersHeaderSelector =
    menuActiveLayersSectionSelector + ' > [data-cy="menu-section-header"]'
const menuHelpSectionHeader = '[data-cy="menu-help-section"] > [data-cy="menu-section-header"]'
const menuShareHeaderSelector = '[data-cy="menu-share-section"] > [data-cy="menu-section-header"]'

interface FakeWMTSLayerCatalogEntry {
    category: string
    id: number
    label: string
    layerBodId: string
    staging: string
}

function getFakeWMTSLayerCatalogEntry(id: number): FakeWMTSLayerCatalogEntry {
    return {
        category: 'layer',
        id: id,
        label: `Fake WMTS layer ${id}`,
        layerBodId: 'test.wmts.layer.' + id,
        staging: 'prod',
    }
}

interface FakeWMTSLayer {
    opacity: number
    attribution: string
    background: boolean
    searchable: boolean
    format: string
    queryableAttributes: string[]
    topics: string
    attributionUrl: string
    tooltip: boolean
    timeEnabled: boolean
    highlightable: boolean
    chargeable: boolean
    timestamps: string[]
    hasLegend: boolean
    label: string
    type: string
    serverLayerName: string
}

function addFakeWMTSLayer(
    layers: Record<string, FakeWMTSLayer>,
    id: number
): Record<string, FakeWMTSLayer> {
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

function getFixturesAndIntercepts(nbLayers: number, nbSelectedLayers: number) {
    const topicId = 'ech'
    return {
        addCatalogIntercept: () => {
            let layersCatalogEntries: FakeWMTSLayerCatalogEntry[] = []
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
            cy.intercept(`**/rest/services/${topicId}/CatalogServer?lang=**`, {
                body: catalog,
            }).as(`topic-${topicId}`)
        },
        addLayerConfigIntercept: () => {
            const layers: Record<string, FakeWMTSLayer> = {}
            for (let i = 2; i < nbLayers + 2; i++) {
                addFakeWMTSLayer(layers, i)
            }
            cy.intercept('**/rest/services/all/MapServer/layersConfig**', {
                body: layers,
            }).as('layers')
        },
        addTopicIntercept: () => {
            const activatedLayers: string[] = []
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
                            plConfig: undefined,
                            selectedLayers: [],
                        },
                    ],
                },
            }).as('topics')
        },
    }
}

function measureMenu(shouldHaveMaxSize: boolean) {
    cy.get(menuTraySelector)
        .then((elems) => elems[0]?.getBoundingClientRect().bottom)
        .as('menuTrayBottom')

    cy.get('@expectedMenuTrayBottom').then((expectedMenuTrayBottom) => {
        if (shouldHaveMaxSize) {
            cy.get('@menuTrayBottom').should('be.equal', expectedMenuTrayBottom)
        } else {
            cy.get('@menuTrayBottom').should('be.lte', expectedMenuTrayBottom)
        }
    })
}

function init(nbLayers: number, nbSelectedLayers: number) {
    cy.goToMapView({
        fixturesAndIntercepts: getFixturesAndIntercepts(nbLayers, nbSelectedLayers),
    })
    cy.getPinia().then((pinia) => {
        const uiStore = useUIStore(pinia)
        cy.wrap(uiStore).as('storeGetters')
        if (uiStore.isPhoneMode) {
            cy.get('[data-cy="menu-button"]').click()
            cy.wrap(height).as('expectedMenuTrayBottom')
        } else if (uiStore.isTabletSize) {
            cy.get('[data-cy="menu-button"]').click()
            cy.wrap(height - 70).as('expectedMenuTrayBottom')
        } else {
            cy.wrap(height - 70).as('expectedMenuTrayBottom')
        }
    })
    cy.get(menuTopicHeaderSelector).click()
    waitForAnimationsToFinish()
}

function waitForAnimationsToFinish() {
    cy.wait(200)
}

function checkOpenSections(openSections: string[]) {
    const sections = [
        {
            name: 'topics',
            selector: '[data-cy="menu-topic-section"]',
        },
        {
            name: 'activeLayers',
            selector: '[data-cy="menu-active-layers"]',
        },
        {
            name: 'help',
            selector: '[data-cy="menu-help-section"]',
        },
        {
            name: 'share',
            selector: '[data-cy="menu-share-section"]',
        },
    ]
    sections.forEach((section) => {
        cy.get(section.selector).should('exist')
        cy.get(`${section.selector} > [data-cy="menu-section-header"]`).scrollIntoView()
        cy.get(`${section.selector} [data-cy="menu-section-body"]`).should(
            `be.${openSections.includes(section.name) ? 'visible' : 'hidden'}`
        )
    })
}

function checkScrollbarVisibility(topicsScrollable: boolean, activeLayersScrollable: boolean) {
    let topicSectionOriginalHeight: number
    cy.get('[data-cy="menu-topic-tree"]')
        .then((elems) => {
            assertDefined(elems[0])
            topicSectionOriginalHeight = elems[0].clientHeight
            return elems
        })
        .parents('[data-cy="menu-section-body"]')
        .should((elems) => {
            assertDefined(elems[0])
            const clientHeight = elems[0].clientHeight
            if (topicsScrollable) {
                expect(clientHeight).to.be.lt(topicSectionOriginalHeight)
            } else {
                expect(clientHeight).to.be.eq(topicSectionOriginalHeight)
            }
        })
    let activeSectionOriginalHeight: number
    cy.get('[data-cy="menu-section-active-layers"]')
        .then((elems) => {
            assertDefined(elems[0])
            activeSectionOriginalHeight = elems[0].clientHeight
            return elems
        })
        .parents('[data-cy="menu-section-body"]')
        .should((elems) => {
            assertDefined(elems[0])
            const clientHeight = elems[0].clientHeight
            if (activeLayersScrollable) {
                expect(clientHeight).to.be.lt(activeSectionOriginalHeight)
            } else {
                expect(clientHeight).to.be.eq(activeSectionOriginalHeight)
            }
        })
}

describe('Test menu tray ui', () => {
    context('Portrait mobile', () => {
        it('check correct sizing of menu and autoclosing of menu sections', function () {
            init(30, 30)
            checkOpenSections(['topics', 'activeLayers'])
            measureMenu(true)
            checkScrollbarVisibility(false, false)

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
        it('no scrolling if menus are small enough', () => {
            init(3, 2)
            checkOpenSections(['topics', 'activeLayers'])
            measureMenu(false)
            checkScrollbarVisibility(false, false)
        })
    })
    context('Landscape mobile', () => {
        beforeEach(() => {
            cy.viewport(568, 320)
        })
        it('check correct sizing of menu and autoclosing of menu sections', function () {
            init(30, 30)
            checkOpenSections(['topics', 'activeLayers'])
            measureMenu(false)
            checkScrollbarVisibility(false, false)

            cy.get(menuActiveLayersHeaderSelector).click()
            waitForAnimationsToFinish()
            checkOpenSections(['topics'])
            measureMenu(false)

            cy.get(menuTopicHeaderSelector).click()
            waitForAnimationsToFinish()
            checkOpenSections([])
            measureMenu(false)

            cy.get(menuActiveLayersHeaderSelector).click()
            waitForAnimationsToFinish()
            checkOpenSections(['activeLayers'])
            measureMenu(false)

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
            measureMenu(false)
        })
        it('no scrolling if menus are small enough', () => {
            init(3, 2)
            checkOpenSections(['topics', 'activeLayers'])
            measureMenu(false)
            checkScrollbarVisibility(false, false)
        })
    })
})
