/// <reference types="cypress" />

const searchbarSelector = '[data-cy="searchbar"]';

describe('Unit test functions for the header / search bar', () => {

    beforeEach(() => {
        cy.goToMapView();
    })

    it('find the searchbar in the UI', () => {
        cy.get(searchbarSelector).should('be.visible');
    })

    context('Testing coordinates typing in search bar', () => {

        // using the same values as coordinateUtils.spec.js (in Unit tests)
        const coordEpsg3857 = [773900, 5976445];
        const WGS84 = [47.2101583, 6.952062];
        const LV95 = [2563138.69, 1228917.22];
        const LV03 = [563138.65, 228917.28];

        const checkCenterInStore = (acceptableDelta = 0.0) => {
            cy.readStoreValue('state.position.center').should(center => {
                expect(center[0]).to.be.approximately(coordEpsg3857[0], acceptableDelta);
                expect(center[1]).to.be.approximately(coordEpsg3857[1], acceptableDelta);
            });
        }
        const checkZoomLevelInStore = () => {
            // checking that the zoom level is at the 1:25'000 map level after a coordinate input in the search bar
            // in world-wide zoom level, it means a 15.5 zoom level (in LV95 zoom level it is 8)
            cy.readStoreValue('state.position.zoom').should('be.eq', 15.5);
        }
        const checkThatCoordinateAreHighlighted = (acceptableDelta) => {
            // checking that a balloon marker has been put on the coordinate location (that it is a highlighted location in the store)
            cy.readStoreValue('state.map.highlightedFeature').should(feature => {
                expect(feature).to.not.be.null;
                expect(feature.coordinate[0]).to.be.approximately(coordEpsg3857[0], acceptableDelta);
                expect(feature.coordinate[1]).to.be.approximately(coordEpsg3857[1], acceptableDelta);
            })
        }
        const numberWithThousandSeparator = (x, separator = "'") => {
            return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, separator);
        }
        const standardCheck = (x, y, title, acceptableDelta = 0.0) => {
            it(title, () => {
                cy.get(searchbarSelector).paste(`${x} ${y}`);
                checkCenterInStore(acceptableDelta)
                checkZoomLevelInStore()
                checkThatCoordinateAreHighlighted(acceptableDelta)
            })
            it(`${title} with comma as a separator`, () => {
                cy.get(searchbarSelector).paste(`${x}, ${y}`);
                checkCenterInStore(acceptableDelta)
                checkZoomLevelInStore()
                checkThatCoordinateAreHighlighted(acceptableDelta)
            })
            it(`${title} with slash as a separator`, () => {
                cy.get(searchbarSelector).paste(`${x}/${y}`);
                checkCenterInStore(acceptableDelta)
                checkZoomLevelInStore()
                checkThatCoordinateAreHighlighted(acceptableDelta)
            })
        }
        const tryAllInputPossibilities = (x, y, coordType, acceptableDelta = 0.0, withBackwardInputCheck = false, withThousandSeparatorCheck = false) => {
            const mainTitle = `sets center accordingly when ${coordType} coordinates are entered in the search bar`;
            standardCheck(x, y, mainTitle, acceptableDelta);
            if (withBackwardInputCheck) {
                standardCheck(y, x, `${mainTitle} with coordinates entered backward`, acceptableDelta);
            }
            if (withThousandSeparatorCheck) {
                standardCheck(numberWithThousandSeparator(x, '\''), numberWithThousandSeparator(y, '\''), `${mainTitle} with ' as thousand separator`, acceptableDelta);
                standardCheck(numberWithThousandSeparator(x, ' '), numberWithThousandSeparator(y, ' '), `${mainTitle} with space as thousand separator`, acceptableDelta);
            }
            if (withThousandSeparatorCheck && withBackwardInputCheck) {
                standardCheck(numberWithThousandSeparator(y, '\''), numberWithThousandSeparator(x, '\''), `${mainTitle} with ' as thousand separator`, acceptableDelta);
                standardCheck(numberWithThousandSeparator(y, ' '), numberWithThousandSeparator(x, ' '), `${mainTitle} with space as thousand separator`, acceptableDelta);
            }
        }

        context('EPSG:4326 (Web-Mercator) inputs', () => {
            // the search bar only supports input in lat/lon format, so X is lat
            const WGS84_DM = ['47°12.6095\'', '6°57.12372\'']
            const WGS84_DMS = ['47°12\'36.57"', '6°57\'7.423"']
            tryAllInputPossibilities(WGS84[0], WGS84[1], 'DD format')
            tryAllInputPossibilities(WGS84_DM[0], WGS84_DM[1], 'DM format')
            tryAllInputPossibilities(WGS84_DMS[0], WGS84_DMS[1], 'DMS format')
        })

        context('EPSG:2056 (LV95) inputs', () => {
            tryAllInputPossibilities(LV95[0], LV95[1], 'LV95', 0.0, true, true)
        })

        context('EPSG:21781 (LV03) inputs', () => {
            tryAllInputPossibilities(LV03[0], LV03[1], 'LV03', 0.1, true, true)
        })

        context('What3Words input', () => {
            const what3words = 'bisher.meiste.einerseits';
            // creating a what3words response stub
            const w3wStub = {
                "country": "CH",
                "coordinates": {
                    "lat": WGS84[0],
                    "lng": WGS84[1],
                },
                "words": what3words,
                "language": "en",
                "map": `https://w3w.co/${what3words}`
            };
            it('Calls the what3words backend when a what3words is entered in the searchbar', () => {
                // starting a server to catch what3words request and stub it with whatever we want
                cy.server();
                cy.route('**/convert-to-coordinates**', w3wStub).as('w3w-convert');
                cy.get(searchbarSelector).paste(what3words);
                // checking that the request to W3W has been made (and caught by Cypress)
                cy.wait('@w3w-convert')
                checkCenterInStore(1);
                checkZoomLevelInStore();
                checkThatCoordinateAreHighlighted(1);
            })
        })

        context('MGRS input', () => {
            const MGRS = "32TLT 44918 30553";
            // as MGRS is a 1m based grid, the point could be anywhere in the square of 1m x 1m, we then accept a 1m delta
            const acceptableDeltaForMGRS = 1;

            it ('sets center accordingly when a MGRS input is given', () => {
                cy.get(searchbarSelector).paste(MGRS);
                checkCenterInStore(acceptableDeltaForMGRS);
                checkZoomLevelInStore();
                checkThatCoordinateAreHighlighted(acceptableDeltaForMGRS);
            })
        })
    })
})
