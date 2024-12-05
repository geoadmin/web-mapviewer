import { expect } from 'chai'
import { beforeEach, describe, it, vi } from 'vitest'

import GeoAdminLayer from '@/api/layers/GeoAdminLayer.class'
import LayerTimeConfig from '@/api/layers/LayerTimeConfig.class'
import CustomCoordinateSystem from '@/utils/coordinates/CustomCoordinateSystem.class'
import SwissCoordinateSystem from '@/utils/coordinates/SwissCoordinateSystem.class'
import * as utils from '@/utils/legacyLayerParamUtils'

import { handleLegacyParam } from '../legacyPermalinkManagement.routerPlugin'

describe('Testing legacyPermalinkManagement', () => {
    let fakeStore
    let params
    let legacyValue
    let newQuery
    let latlongCoordinates
    let legacyCoordinates
    let cameraPosition

    beforeEach(() => {
        params = new Map()
        legacyValue = 10
        newQuery = {}
        latlongCoordinates = []
        legacyCoordinates = []
        cameraPosition = [null, null, null, null, null, null]
        fakeStore = {
            state: {
                position: {},
            },
        }
    })

    function handleLegacyParams(args = {}) {
        const defaults = {
            param: undefined,
            fakeStore,
            params,
            legacyValue,
            newQuery,
            latlongCoordinates,
            legacyCoordinates,
            cameraPosition,
        }

        const {
            params: finalParams,
            param: finalParam,
            legacyValue: finalLegacyValue,
            newQuery: finalNewQuery,
            latlongCoordinates: finalLatlongCoordinates,
            legacyCoordinates: finalLegacyCoordinates,
            cameraPosition: finalCameraPosition,
            fakeStore: finalFakeStore,
        } = { ...defaults, ...args }

        handleLegacyParam(
            finalParams,
            finalParam,
            finalLegacyValue,
            finalFakeStore,
            finalNewQuery,
            finalLatlongCoordinates,
            finalLegacyCoordinates,
            finalCameraPosition
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
        it('zoom without projection', () => {
            const param = 'zoom'
            handleLegacyParams({ param })
            expect(newQuery).to.deep.equal({ z: '16.7' })
        })
        // FIXME: the function transformStandardZoomLevelToCustom is not implemented in CustomCoordinateSystem therefore it fails
        it.skip('zoom with projection CustomCoordinateSystem', () => {
            const fakeStore = {
                state: {
                    position: {
                        projection: new CustomCoordinateSystem('4326', 'WGS 84', null),
                    },
                },
            }
            const param = 'zoom'
            handleLegacyParams({ param, fakeStore })
            expect(newQuery).to.deep.equal({ z: '16.7' })
        })
        it('zoom with projection SwissCoordinateSystem', () => {
            const fakeStore = {
                state: {
                    position: {
                        projection: new SwissCoordinateSystem(),
                    },
                },
            }
            const param = 'zoom'

            handleLegacyParams({ param, fakeStore })
            expect(newQuery).to.deep.equal({ z: `${legacyValue}` })
        })
        it('N', () => {
            const param = 'N'
            const legacyCoordinates = [0, 0]
            handleLegacyParams({ param, legacyCoordinates })

            expect(legacyCoordinates).to.deep.equal([0, legacyValue])
        })
        it('X', () => {
            const param = 'X'
            const legacyCoordinates = [0, 0]

            handleLegacyParams({ param, legacyCoordinates })

            expect(legacyCoordinates).to.deep.equal([0, legacyValue])
        })
        it('E', () => {
            const param = 'E'
            const legacyCoordinates = [0, 0]

            handleLegacyParams({ param, legacyCoordinates })

            expect(legacyCoordinates).to.deep.equal([legacyValue, 0])
        })
        it('Y', () => {
            const param = 'Y'
            const legacyCoordinates = [0, 0]

            handleLegacyParams({ param, legacyCoordinates })

            expect(legacyCoordinates).to.deep.equal([legacyValue, 0])
        })
        it('lon', () => {
            const param = 'lon'
            const legacyValue = '10'
            const latlongCoordinates = [0, 0]

            handleLegacyParams({ param, latlongCoordinates, legacyValue })

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
            const latlongCoordinates = [0, 0]

            handleLegacyParams({ param, latlongCoordinates, legacyValue })

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

            handleLegacyParams({ param, legacyValue })

            expect(newQuery).to.deep.equal({ layers: ['@feature'] })
            expect(utils.getLayersFromLegacyUrlParams).not.toHaveBeenCalled()
        })
        it('layers without new separators', () => {
            const fakeStore = {
                state: {
                    layers: {
                        config: [layerConfig],
                    },
                    position: {},
                },
                getters: {
                    getLayerConfigById: (_) => {
                        layerConfig
                    },
                },
            }
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

            handleLegacyParams({ param, legacyValue, params, fakeStore })

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

            handleLegacyParams({ param, legacyValue })

            expect(newQuery).to.deep.equal({ compareRatio: legacyValue })
        })
        it('time', () => {
            const param = 'time'
            const legacyValue = 'legacyValue'

            handleLegacyParams({ param, legacyValue })

            expect(newQuery).to.deep.equal({ timeSlider: legacyValue })
        })
        it('layers_opacity', () => {
            const param = 'layers_opacity'

            handleLegacyParams({ param })

            expect(newQuery).to.deep.equal({})
        })
        it('layers_visibility', () => {
            const param = 'layers_visibility'

            handleLegacyParams({ param })

            expect(newQuery).to.deep.equal({})
        })
        it('layers_timestamp', () => {
            const param = 'layers_timestamp'

            handleLegacyParams({ param })

            expect(newQuery).to.deep.equal({})
        })
        it('elevation', () => {
            const param = 'elevation'
            const legacyValue = '3'

            handleLegacyParams({ param, legacyValue })

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

            handleLegacyParams({ param, legacyValue })

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

            handleLegacyParams({ param, legacyValue })

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

            handleLegacyParams({ param, legacyValue })

            expect(newQuery).to.deep.equal({ featureInfo: 'default' })
        })
        it('showTooltip with legacyValue false', () => {
            const param = 'showTooltip'
            const legacyValue = 'false'

            handleLegacyParams({ param, legacyValue })

            expect(newQuery).to.deep.equal({ featureInfo: 'none' })
        })
        it('bgLayer with legacyValue voidLayer', () => {
            const param = 'bgLayer'
            const legacyValue = 'voidLayer'

            handleLegacyParams({ param, legacyValue })

            expect(newQuery).to.deep.equal({ bgLayer: 'void' })
        })
        it('bgLayer with legacyValue != voidLayer', () => {
            const param = 'bgLayer'
            const legacyValue = 'test'

            handleLegacyParams({ param, legacyValue })

            expect(newQuery).to.deep.equal({ bgLayer: legacyValue })
        })
        it('default value', () => {
            const param = 'testtest'
            const legacyValue = 'test'

            handleLegacyParams({ param, legacyValue })

            expect(newQuery).to.deep.equal({ testtest: legacyValue })
        })
    })
})
