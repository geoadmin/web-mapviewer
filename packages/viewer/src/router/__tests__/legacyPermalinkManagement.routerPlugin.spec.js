import { allCoordinateSystems } from '@swissgeo/coordinates'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import GeoAdminLayer from '@/api/layers/GeoAdminLayer.class'
import LayerTimeConfig from '@/api/layers/LayerTimeConfig.class'
import { handleLegacyParam } from '@/router/legacyPermalinkManagement.routerPlugin'
import * as utils from '@/utils/legacyLayerParamUtils'

describe('Testing legacyPermalinkManagement', () => {
    let fakeStore
    let newQuery
    let latlongCoordinates
    let legacyCoordinates
    let cameraPosition

    beforeEach(() => {
        newQuery = {}
        latlongCoordinates = []
        legacyCoordinates = []
        cameraPosition = [null, null, null, null, null, null]
        fakeStore = {
            state: {
                position: {
                    projection: allCoordinateSystems[0],
                },
                layers: {
                    config: [layerConfig],
                },
            },
            getters: {
                getLayerConfigById: (_) => (
                    layerConfig
                ),
            },
        }
    })

    function testHandleLegacyParam(param, legacyValue, params = new Map()) {
        handleLegacyParam(
            params,
            param,
            legacyValue,
            fakeStore,
            newQuery,
            latlongCoordinates,
            legacyCoordinates,
            cameraPosition
        )
    }

    const layerConfig = new GeoAdminLayer({
        attributions: [{ name: 'OFEN', url: 'https://www.bfe.admin.ch/bfe/fr/home.html' }],
        baseUrl: 'https://sys-wmts.dev.bgdi.ch/',
        customAttributes: null,
        errorMessages: [],
        format: 'png',
        hasDescription: true,
        hasError: false,
        hasLegend: true,
        hasMultipleTimestamps: false,
        hasTooltip: true,
        id: 'ch.bfe.ladebedarfswelt-heimladeverfuegbarkeit_bequem',
        idIn3d: null,
        isBackground: false,
        isExternal: false,
        isHighlightable: true,
        isLoading: false,
        isSpecificFor3D: false,
        maxResolution: 2,
        name: 'Besoin en charge: Disponibilité de la charge à domicile - Confortable',
        opacity: 0.75,
        searchable: true,
        technicalName: 'ch.bfe.ladebedarfswelt-heimladeverfuegbarkeit_bequem',
        timeConfig: new LayerTimeConfig(),
        topics: ['api', 'ech', 'energie'],
        type: 'WMTS',
        visible: false,
    })

    describe('handleLegacyParam with following parameters', () => {
        it('zoom with allCoordinateSystems', () => {
            const newValues = [10, 10, 16.7, 16.7]
            allCoordinateSystems.forEach((coordinateSystem, index) => {
                fakeStore = {
                    state: {
                        position: {
                            projection: coordinateSystem,
                        },
                    },
                }
                const param = 'zoom'
                const legacyValue = 10
                testHandleLegacyParam(param, legacyValue)
                const { z } = newQuery
                expect(parseFloat(z)).to.approximately(newValues[index], 0.01)
            })
        })
        it('N', () => {
            const param = 'N'
            legacyCoordinates = [0, 0]
            const legacyValue = 10

            testHandleLegacyParam(param, legacyValue)
            expect(legacyCoordinates).to.eql([0, legacyValue])
        })
        it('N with empty legacyCoordinates', () => {
            const param = 'N'
            legacyCoordinates = []
            const legacyValue = 10

            testHandleLegacyParam(param, legacyValue)
            expect(legacyCoordinates).to.eql([undefined, legacyValue])
        })
        it('X', () => {
            const param = 'X'
            legacyCoordinates = [0, 0]
            const legacyValue = 10

            testHandleLegacyParam(param, legacyValue)

            expect(legacyCoordinates).to.eql([0, legacyValue])
        })
        it('E', () => {
            const param = 'E'
            legacyCoordinates = [0, 0]
            const legacyValue = 10

            testHandleLegacyParam(param, legacyValue)

            expect(legacyCoordinates).to.eql([legacyValue, 0])
        })
        it('Y', () => {
            const param = 'Y'
            legacyCoordinates = [0, 0]
            const legacyValue = 10

            testHandleLegacyParam(param, legacyValue)

            expect(legacyCoordinates).to.eql([legacyValue, 0])
        })
        it('lon', () => {
            const param = 'lon'
            const legacyValue = '10'
            latlongCoordinates = [0, 0]

            testHandleLegacyParam(param, legacyValue)

            expect(latlongCoordinates).to.eql([Number(legacyValue), 0])
            expect(cameraPosition).to.eql([
                Number(legacyValue),
                null,
                null,
                null,
                null,
                null,
            ])
        })
        it('lat', () => {
            const param = 'lat'
            const legacyValue = '10'
            latlongCoordinates = [0, 0]

            testHandleLegacyParam(param, legacyValue)

            expect(latlongCoordinates).to.eql([0, Number(legacyValue)])
            expect(cameraPosition).to.eql([
                null,
                Number(legacyValue),
                null,
                null,
                null,
                null,
            ])
        })
        // for some reason this breaks with the new TS/ESLint config
        // TODO PB-1383: reactivate this test as soon as the store is moved to TS (and this test file too)
        it.skip('layers with new separators', () => {
            const param = 'layers'
            const legacyValue = ['@feature']
            vi.spyOn(utils, 'getLayersFromLegacyUrlParams')

            testHandleLegacyParam(param, legacyValue)

            expect(newQuery).to.eql({ layers: ['@feature'] })
            expect(utils.getLayersFromLegacyUrlParams).not.have.been.called
        })
        it('layers without new separators', () => {
            const layerVisibility = 'layers_visibility'
            const layerOpacity = '0.75'
            const layerTimestamp = 'layers_timestamp'
            const params = new Map([
                ['layers_visibility', layerVisibility],
                ['layers_opacity', layerOpacity],
                ['layers_timestamp', layerTimestamp],
            ])
            const param = 'layers'
            const legacyValue = 'ch.bfe.ladebedarfswelt-heimladeverfuegbarkeit_bequem'
            vi.spyOn(utils, 'getLayersFromLegacyUrlParams')

            testHandleLegacyParam(param, legacyValue, params)

            expect(newQuery).to.eql({ layers: `${legacyValue},f` })
            expect(utils.getLayersFromLegacyUrlParams).toHaveBeenCalledWith(
                [layerConfig],
                legacyValue,
                layerVisibility,
                layerOpacity,
                layerTimestamp
            )
        })
        it('swipe_ratio', () => {
            const param = 'swipe_ratio'
            const legacyValue = 'legacyValue'

            testHandleLegacyParam(param, legacyValue)

            expect(newQuery).to.eql({ compareRatio: legacyValue })
        })
        it('time', () => {
            const param = 'time'
            const legacyValue = 'legacyValue'

            testHandleLegacyParam(param, legacyValue)

            expect(newQuery).to.eql({ timeSlider: legacyValue })
        })
        it('layers_opacity', () => {
            const param = 'layers_opacity'
            const legacyValue = 10

            testHandleLegacyParam(param, legacyValue)

            expect(newQuery).to.eql({})
        })
        it('layers_visibility', () => {
            const param = 'layers_visibility'
            const legacyValue = 10

            testHandleLegacyParam(param, legacyValue)

            expect(newQuery).to.eql({})
        })
        it('layers_timestamp', () => {
            const param = 'layers_timestamp'
            const legacyValue = 10

            testHandleLegacyParam(param, legacyValue)

            expect(newQuery).to.eql({})
        })
        it('elevation', () => {
            const param = 'elevation'
            const legacyValue = '3'

            testHandleLegacyParam(param, legacyValue)

            expect(cameraPosition).to.eql([
                null,
                null,
                Number(legacyValue),
                null,
                null,
                null,
            ])
        })
        it('pitch', () => {
            const param = 'pitch'
            const legacyValue = '3'

            testHandleLegacyParam(param, legacyValue)

            expect(cameraPosition).to.eql([
                null,
                null,
                null,
                Number(legacyValue),
                null,
                null,
            ])
        })
        it('heading', () => {
            const param = 'heading'
            const legacyValue = '3'

            testHandleLegacyParam(param, legacyValue)

            expect(cameraPosition).to.eql([
                null,
                null,
                null,
                null,
                Number(legacyValue),
                null,
            ])
        })
        it('showTooltip with legacyValue true', () => {
            const param = 'showTooltip'
            const legacyValue = 'true'

            testHandleLegacyParam(param, legacyValue)

            expect(newQuery).to.eql({ featureInfo: 'default' })
        })
        it('showTooltip with legacyValue false', () => {
            const param = 'showTooltip'
            const legacyValue = 'false'

            testHandleLegacyParam(param, legacyValue)

            expect(newQuery).to.eql({ featureInfo: 'none' })
        })
        it('bgLayer with legacyValue voidLayer', () => {
            const param = 'bgLayer'
            const legacyValue = 'voidLayer'

            testHandleLegacyParam(param, legacyValue)

            expect(newQuery).to.eql({ bgLayer: 'void' })
        })
        it('bgLayer with legacyValue != voidLayer', () => {
            const param = 'bgLayer'
            const legacyValue = 'test'

            testHandleLegacyParam(param, legacyValue)

            expect(newQuery).to.eql({ bgLayer: legacyValue })
        })
        it('default value', () => {
            const param = 'testtest'
            const legacyValue = 'test'

            testHandleLegacyParam(param, legacyValue)

            expect(newQuery).to.eql({ testtest: legacyValue })
        })
    })
})
