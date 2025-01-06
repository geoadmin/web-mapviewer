import { expect } from 'chai'
import { beforeEach, describe, it, vi } from 'vitest'

import GeoAdminLayer from '@/api/layers/GeoAdminLayer.class'
import LayerTimeConfig from '@/api/layers/LayerTimeConfig.class'
import { handleLegacyParam } from '@/router/legacyPermalinkManagement.routerPlugin'
import allCoordinateSystems from '@/utils/coordinates/coordinateSystems'
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
                getLayerConfigById: (_) => {
                    layerConfig
                },
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
                expect(newQuery).to.deep.equal({ z: `${newValues[index]}` })
            })
        })
        it('N', () => {
            const param = 'N'
            legacyCoordinates = [0, 0]
            const legacyValue = 10

            testHandleLegacyParam(param, legacyValue)
            expect(legacyCoordinates).to.deep.equal([0, legacyValue])
        })
        it('N with empty legacyCoordinates', () => {
            const param = 'N'
            legacyCoordinates = []
            const legacyValue = 10

            testHandleLegacyParam(param, legacyValue)
            expect(legacyCoordinates).to.deep.equal([undefined, legacyValue])
        })
        it('X', () => {
            const param = 'X'
            legacyCoordinates = [0, 0]
            const legacyValue = 10

            testHandleLegacyParam(param, legacyValue)

            expect(legacyCoordinates).to.deep.equal([0, legacyValue])
        })
        it('E', () => {
            const param = 'E'
            legacyCoordinates = [0, 0]
            const legacyValue = 10

            testHandleLegacyParam(param, legacyValue)

            expect(legacyCoordinates).to.deep.equal([legacyValue, 0])
        })
        it('Y', () => {
            const param = 'Y'
            legacyCoordinates = [0, 0]
            const legacyValue = 10

            testHandleLegacyParam(param, legacyValue)

            expect(legacyCoordinates).to.deep.equal([legacyValue, 0])
        })
        it('lon', () => {
            const param = 'lon'
            const legacyValue = '10'
            latlongCoordinates = [0, 0]

            testHandleLegacyParam(param, legacyValue)

            expect(latlongCoordinates).to.deep.equal([Number(legacyValue), 0])
            expect(cameraPosition).to.deep.equal([
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

            expect(latlongCoordinates).to.deep.equal([0, Number(legacyValue)])
            expect(cameraPosition).to.deep.equal([
                null,
                Number(legacyValue),
                null,
                null,
                null,
                null,
            ])
        })
        it('layers with new separators', () => {
            const param = 'layers'
            const legacyValue = ['@feature']
            vi.spyOn(utils, 'getLayersFromLegacyUrlParams')

            testHandleLegacyParam(param, legacyValue)

            expect(newQuery).to.deep.equal({ layers: ['@feature'] })
            expect(utils.getLayersFromLegacyUrlParams).not.toHaveBeenCalled()
        })
        it('layers without new separators', () => {
            const layerVisibility = 'layers_visibility'
            const layerOpacity = 'layers_opacity'
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

            expect(newQuery).to.deep.equal({ layers: `${legacyValue},f` })
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

            expect(newQuery).to.deep.equal({ compareRatio: legacyValue })
        })
        it('time', () => {
            const param = 'time'
            const legacyValue = 'legacyValue'

            testHandleLegacyParam(param, legacyValue)

            expect(newQuery).to.deep.equal({ timeSlider: legacyValue })
        })
        it('layers_opacity', () => {
            const param = 'layers_opacity'
            const legacyValue = 10

            testHandleLegacyParam(param, legacyValue)

            expect(newQuery).to.deep.equal({})
        })
        it('layers_visibility', () => {
            const param = 'layers_visibility'
            const legacyValue = 10

            testHandleLegacyParam(param, legacyValue)

            expect(newQuery).to.deep.equal({})
        })
        it('layers_timestamp', () => {
            const param = 'layers_timestamp'
            const legacyValue = 10

            testHandleLegacyParam(param, legacyValue)

            expect(newQuery).to.deep.equal({})
        })
        it('elevation', () => {
            const param = 'elevation'
            const legacyValue = '3'

            testHandleLegacyParam(param, legacyValue)

            expect(cameraPosition).to.deep.equal([
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

            expect(cameraPosition).to.deep.equal([
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

            expect(cameraPosition).to.deep.equal([
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

            expect(newQuery).to.deep.equal({ featureInfo: 'default' })
        })
        it('showTooltip with legacyValue false', () => {
            const param = 'showTooltip'
            const legacyValue = 'false'

            testHandleLegacyParam(param, legacyValue)

            expect(newQuery).to.deep.equal({ featureInfo: 'none' })
        })
        it('bgLayer with legacyValue voidLayer', () => {
            const param = 'bgLayer'
            const legacyValue = 'voidLayer'

            testHandleLegacyParam(param, legacyValue)

            expect(newQuery).to.deep.equal({ bgLayer: 'void' })
        })
        it('bgLayer with legacyValue != voidLayer', () => {
            const param = 'bgLayer'
            const legacyValue = 'test'

            testHandleLegacyParam(param, legacyValue)

            expect(newQuery).to.deep.equal({ bgLayer: legacyValue })
        })
        it('default value', () => {
            const param = 'testtest'
            const legacyValue = 'test'

            testHandleLegacyParam(param, legacyValue)

            expect(newQuery).to.deep.equal({ testtest: legacyValue })
        })
    })
})
