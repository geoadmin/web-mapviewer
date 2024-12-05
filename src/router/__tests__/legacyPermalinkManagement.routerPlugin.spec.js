import { expect } from 'chai'
import { beforeEach, describe, it } from 'vitest'

import GeoAdminLayer from '@/api/layers/GeoAdminLayer.class'
import LayerTimeConfig from '@/api/layers/LayerTimeConfig.class'
import CustomCoordinateSystem from '@/utils/coordinates/CustomCoordinateSystem.class'
import SwissCoordinateSystem from '@/utils/coordinates/SwissCoordinateSystem.class'

import { handleLegacyParam } from '../legacyPermalinkManagement.routerPlugin'

describe('Testing legacyPermalinkManagement', () => {
    let fakeStore = {}
    beforeEach(() => {
        fakeStore = {
            state: {
                position: {
                    center: [0, 0],
                    zoom: 0,
                    camera: {
                        x: 0,
                        y: 0,
                        z: 0,
                        pitch: 0,
                        heading: 0,
                        roll: 0,
                    },
                },
                cesium: {
                    active: false,
                },
            },
            getters: {
                centerEpsg4326: [0, 0],
            },
        }
    })

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
    describe('handleLegacyParam', () => {
        it('zoom without projection', () => {
            const params = new Map()
            const param = 'zoom'
            let legacyValue = 10
            let newQuery = {}
            let latlongCoordinates = []
            let legacyCoordinates = []
            let cameraPosition = [null, null, null, null, null, null]

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
            expect(newQuery).to.deep.equal({ z: '16.7' })
        })
        // FIXME: the function transformStandardZoomLevelToCustom is not implemented in CustomCoordinateSystem therefore it fails
        it.skip('zoom with projection CustomCoordinateSystem', () => {
            fakeStore = {
                state: {
                    position: {
                        projection: new CustomCoordinateSystem('4326', 'WGS 84', null),
                    },
                },
            }
            const params = new Map()
            const param = 'zoom'
            let legacyValue = 10
            let newQuery = {}
            let latlongCoordinates = []
            let legacyCoordinates = []
            let cameraPosition = [null, null, null, null, null, null]
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
            expect(newQuery).to.deep.equal({ z: '16.7' })
        })
        it('zoom with projection SwissCoordinateSystem', () => {
            fakeStore = {
                state: {
                    position: {
                        projection: new SwissCoordinateSystem(),
                    },
                },
            }
            const params = new Map()
            const param = 'zoom'
            let legacyValue = 10
            let newQuery = {}
            let latlongCoordinates = []
            let legacyCoordinates = []
            let cameraPosition = [null, null, null, null, null, null]

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
            expect(newQuery).to.deep.equal({ z: `${legacyValue}` })
        })
        it('N', () => {
            const params = new Map()
            const param = 'N'
            let legacyValue = 10
            let newQuery = {}
            let latlongCoordinates = []
            let legacyCoordinates = [0, 0]
            let cameraPosition = [null, null, null, null, null, null]

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
            expect(legacyCoordinates).to.deep.equal([0, legacyValue])
        })
        it('X', () => {
            const params = new Map()
            const param = 'X'
            let legacyValue = 10
            let newQuery = {}
            let latlongCoordinates = []
            let legacyCoordinates = [0, 0]
            let cameraPosition = [null, null, null, null, null, null]

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
            expect(legacyCoordinates).to.deep.equal([0, legacyValue])
        })
        it('E', () => {
            const params = new Map()
            const param = 'E'
            let legacyValue = 10
            let newQuery = {}
            let latlongCoordinates = []
            let legacyCoordinates = [0, 0]
            let cameraPosition = [null, null, null, null, null, null]

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
            expect(legacyCoordinates).to.deep.equal([legacyValue, 0])
        })
        it('Y', () => {
            const params = new Map()
            const param = 'Y'
            let legacyValue = 10
            let newQuery = {}
            let latlongCoordinates = []
            let legacyCoordinates = [0, 0]
            let cameraPosition = [null, null, null, null, null, null]

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
            expect(legacyCoordinates).to.deep.equal([legacyValue, 0])
        })
        it('lon', () => {
            const params = new Map()
            const param = 'lon'
            let legacyValue = '10'
            let newQuery = {}
            let latlongCoordinates = [0, 0]
            let legacyCoordinates = []
            let cameraPosition = [null, null, null, null, null, null]

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
            const params = new Map()
            const param = 'lat'
            let legacyValue = '10'
            let newQuery = {}
            let latlongCoordinates = [0, 0]
            let legacyCoordinates = []
            let cameraPosition = [null, null, null, null, null, null]

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
            const params = new Map()
            const param = 'layers'
            let legacyValue = ['@feature']
            let newQuery = {}
            let latlongCoordinates = []
            let legacyCoordinates = []
            let cameraPosition = [null, null, null, null, null, null]

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
            expect(newQuery).to.deep.equal({ layers: ['@feature'] })
        })
        it('layers without new separators', () => {
            fakeStore = {
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
            const params = new Map([
                ['layers_visibility', 'layers_visibility'],
                ['layers_opacity', 'layers_opacity'],
                ['layers_timestamp', 'layers_timestamp'],
            ])
            const param = 'layers'
            let legacyValue = 'ch.bfe.ladebedarfswelt-heimladeverfuegbarkeit_bequem'
            let newQuery = {}
            let latlongCoordinates = []
            let legacyCoordinates = []
            let cameraPosition = [null, null, null, null, null, null]

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
            expect(newQuery).to.deep.equal({ layers: `${legacyValue},f` })
        })
        it('swipe_ratio', () => {
            const params = new Map()
            const param = 'swipe_ratio'
            let legacyValue = 'legacyValue'
            let newQuery = {}
            let latlongCoordinates = []
            let legacyCoordinates = []
            let cameraPosition = [null, null, null, null, null, null]

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
            expect(newQuery).to.deep.equal({ compareRatio: legacyValue })
        })
        it('time', () => {
            const params = new Map()
            const param = 'time'
            let legacyValue = 'legacyValue'
            let newQuery = {}
            let latlongCoordinates = []
            let legacyCoordinates = []
            let cameraPosition = [null, null, null, null, null, null]

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
            expect(newQuery).to.deep.equal({ timeSlider: legacyValue })
        })
        it('layers_opacity', () => {
            const params = new Map()
            const param = 'layers_opacity'
            let legacyValue = 'legacyValue'
            let newQuery = {}
            let latlongCoordinates = []
            let legacyCoordinates = []
            let cameraPosition = [null, null, null, null, null, null]

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
            expect(newQuery).to.deep.equal({})
        })
        it('layers_opacity', () => {
            const params = new Map()
            const param = 'layers_opacity'
            let legacyValue = 'legacyValue'
            let newQuery = {}
            let latlongCoordinates = []
            let legacyCoordinates = []
            let cameraPosition = [null, null, null, null, null, null]

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
            expect(newQuery).to.deep.equal({})
        })
        it('layers_timestamp', () => {
            const params = new Map()
            const param = 'layers_timestamp'
            let legacyValue = 'legacyValue'
            let newQuery = {}
            let latlongCoordinates = []
            let legacyCoordinates = []
            let cameraPosition = [null, null, null, null, null, null]

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
            expect(newQuery).to.deep.equal({})
        })
        it('elevation', () => {
            const params = new Map()
            const param = 'elevation'
            let legacyValue = '3'
            let newQuery = {}
            let latlongCoordinates = []
            let legacyCoordinates = []
            let cameraPosition = [null, null, null, null, null, null]

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
            const params = new Map()
            const param = 'pitch'
            let legacyValue = '3'
            let newQuery = {}
            let latlongCoordinates = []
            let legacyCoordinates = []
            let cameraPosition = [null, null, null, null, null, null]

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
            const params = new Map()
            const param = 'heading'
            let legacyValue = '3'
            let newQuery = {}
            let latlongCoordinates = []
            let legacyCoordinates = []
            let cameraPosition = [null, null, null, null, null, null]

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
            const params = new Map()
            const param = 'showTooltip'
            let legacyValue = 'true'
            let newQuery = {}
            let latlongCoordinates = []
            let legacyCoordinates = []
            let cameraPosition = [null, null, null, null, null, null]

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
            expect(newQuery).to.deep.equal({ featureInfo: 'default' })
        })
        it('showTooltip with legacyValue false', () => {
            const params = new Map()
            const param = 'showTooltip'
            let legacyValue = 'false'
            let newQuery = {}
            let latlongCoordinates = []
            let legacyCoordinates = []
            let cameraPosition = [null, null, null, null, null, null]

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
            expect(newQuery).to.deep.equal({ featureInfo: 'none' })
        })
        it('bgLayer with legacyValue voidLayer', () => {
            const params = new Map()
            const param = 'bgLayer'
            let legacyValue = 'voidLayer'
            let newQuery = {}
            let latlongCoordinates = []
            let legacyCoordinates = []
            let cameraPosition = [null, null, null, null, null, null]

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
            expect(newQuery).to.deep.equal({ bgLayer: 'void' })
        })
        it('bgLayer with legacyValue != voidLayer', () => {
            const params = new Map()
            const param = 'bgLayer'
            let legacyValue = 'test'
            let newQuery = {}
            let latlongCoordinates = []
            let legacyCoordinates = []
            let cameraPosition = [null, null, null, null, null, null]

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
            expect(newQuery).to.deep.equal({ bgLayer: legacyValue })
        })
        it('default value', () => {
            const params = new Map()
            const param = 'testtest'
            let legacyValue = 'test'
            let newQuery = {}
            let latlongCoordinates = []
            let legacyCoordinates = []
            let cameraPosition = [null, null, null, null, null, null]

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
            expect(newQuery).to.deep.equal({ testtest: legacyValue })
        })
    })
})
