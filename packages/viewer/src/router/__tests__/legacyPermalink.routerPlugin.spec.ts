import type { SingleCoordinate } from '@swissgeo/coordinates'
import type { GeoAdminLayer } from '@swissgeo/layers'
import type { LocationQueryRaw } from 'vue-router'

import { allCoordinateSystems } from '@swissgeo/coordinates'
import { layerUtils } from '@swissgeo/layers/utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import type { StoreInputForLegacyParsing } from '@/router/legacyPermalink.routerPlugin'
import type { CameraPosition } from '@/store/modules/position/types'

import { handleLegacyParam } from '@/router/legacyPermalink.routerPlugin'
import * as utils from '@/utils/legacyLayerParamUtils'

const UNSET_NUMBER_VALUE: number = Number.NEGATIVE_INFINITY

describe('Testing legacyPermalink router plugin', () => {
    let fakeStoreInput: StoreInputForLegacyParsing
    let newQuery: LocationQueryRaw
    let latlongCoordinates: SingleCoordinate
    let legacyCoordinates: SingleCoordinate
    let cameraPosition: CameraPosition
    let exisitingParams: URLSearchParams

    const layerConfig: GeoAdminLayer = layerUtils.makeGeoAdminWMTSLayer({
        attributions: [{ name: 'OFEN', url: 'https://www.bfe.admin.ch/bfe/fr/home.html' }],
        baseUrl: 'https://sys-wmts.dev.bgdi.ch/',
        errorMessages: [],
        format: 'png',
        hasDescription: true,
        hasError: false,
        hasLegend: true,
        hasTooltip: true,
        id: 'ch.bfe.ladebedarfswelt-heimladeverfuegbarkeit_bequem',
        isBackground: false,
        isExternal: false,
        isHighlightable: true,
        isLoading: false,
        maxResolution: 2,
        name: 'Besoin en charge: Disponibilité de la charge à domicile - Confortable',
        opacity: 0.75,
        searchable: true,
        technicalName: 'ch.bfe.ladebedarfswelt-heimladeverfuegbarkeit_bequem',
        topics: ['api', 'ech', 'energie'],
        isVisible: false,
    })

    beforeEach(() => {
        newQuery = {}
        latlongCoordinates = [UNSET_NUMBER_VALUE, UNSET_NUMBER_VALUE]
        legacyCoordinates = [UNSET_NUMBER_VALUE, UNSET_NUMBER_VALUE]
        cameraPosition = {
            x: UNSET_NUMBER_VALUE,
            y: UNSET_NUMBER_VALUE,
            z: UNSET_NUMBER_VALUE,
            heading: UNSET_NUMBER_VALUE,
            pitch: UNSET_NUMBER_VALUE,
            roll: UNSET_NUMBER_VALUE,
        }
        fakeStoreInput = {
            config: [layerConfig],
            projection: allCoordinateSystems[0]!,
        }
        exisitingParams = new URLSearchParams()
    })

    function testHandleLegacyParam(param: string, legacyValue: string | number) {
        handleLegacyParam(
            exisitingParams,
            param,
            legacyValue,
            newQuery,
            latlongCoordinates,
            legacyCoordinates,
            cameraPosition,
            fakeStoreInput
        )
    }

    function testCameraValues(values: Partial<CameraPosition>) {
        const {
            x = UNSET_NUMBER_VALUE,
            y = UNSET_NUMBER_VALUE,
            z = UNSET_NUMBER_VALUE,
            heading = UNSET_NUMBER_VALUE,
            pitch = UNSET_NUMBER_VALUE,
            roll = UNSET_NUMBER_VALUE,
        } = values

        expect(cameraPosition.x).to.eql(x)
        expect(cameraPosition.y).to.eql(y)
        expect(cameraPosition.z).to.eql(z)
        expect(cameraPosition.heading).to.eql(heading)
        expect(cameraPosition.pitch).to.eql(pitch)
        expect(cameraPosition.roll).to.eql(roll)
    }

    describe('handleLegacyParam with following parameters', () => {
        it('zoom with allCoordinateSystems', () => {
            const newValues = [10, 10, 16.7, 16.7]
            allCoordinateSystems.forEach((coordinateSystem, index) => {
                fakeStoreInput.projection = coordinateSystem
                const param = 'zoom'
                const legacyValue = 10
                testHandleLegacyParam(param, legacyValue)
                const { z } = newQuery
                expect(z).to.be.a('string')
                expect(parseFloat(z as string)).to.approximately(newValues[index]!, 0.01)
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
            legacyCoordinates = [UNSET_NUMBER_VALUE, UNSET_NUMBER_VALUE]
            const legacyValue = 10

            testHandleLegacyParam(param, legacyValue)
            expect(legacyCoordinates).to.eql([UNSET_NUMBER_VALUE, legacyValue])
        })
        it('X', () => {
            const param = 'X'
            legacyCoordinates = [UNSET_NUMBER_VALUE, UNSET_NUMBER_VALUE]
            const legacyValue = 10

            testHandleLegacyParam(param, legacyValue)

            expect(legacyCoordinates).to.eql([UNSET_NUMBER_VALUE, legacyValue])
        })
        it('E', () => {
            const param = 'E'
            legacyCoordinates = [UNSET_NUMBER_VALUE, UNSET_NUMBER_VALUE]
            const legacyValue = 10

            testHandleLegacyParam(param, legacyValue)

            expect(legacyCoordinates).to.eql([legacyValue, UNSET_NUMBER_VALUE])
        })
        it('Y', () => {
            const param = 'Y'
            legacyCoordinates = [UNSET_NUMBER_VALUE, UNSET_NUMBER_VALUE]
            const legacyValue = 10

            testHandleLegacyParam(param, legacyValue)

            expect(legacyCoordinates).to.eql([legacyValue, UNSET_NUMBER_VALUE])
        })
        it('lon', () => {
            const param = 'lon'
            const legacyValue = '10'
            latlongCoordinates = [UNSET_NUMBER_VALUE, UNSET_NUMBER_VALUE]

            testHandleLegacyParam(param, legacyValue)

            expect(latlongCoordinates).to.eql([Number(legacyValue), UNSET_NUMBER_VALUE])
            testCameraValues({ x: Number(legacyValue) })
        })
        it('lat', () => {
            const param = 'lat'
            const legacyValue = '10'
            latlongCoordinates = [UNSET_NUMBER_VALUE, UNSET_NUMBER_VALUE]

            testHandleLegacyParam(param, legacyValue)

            expect(latlongCoordinates).to.eql([UNSET_NUMBER_VALUE, Number(legacyValue)])
            testCameraValues({ y: Number(legacyValue) })
        })
        // for some reason this breaks with the new TS/ESLint config
        // TODO PB-1383: reactivate this test as soon as the store is moved to TS (and this test file too)
        it.skip('layers with new separators', () => {
            const param = 'layers'
            const legacyValue = '@feature'
            vi.spyOn(utils, 'getLayersFromLegacyUrlParams')

            testHandleLegacyParam(param, legacyValue)

            expect(newQuery).to.eql({ layers: ['@feature'] })
            expect(utils.getLayersFromLegacyUrlParams).not.have.been.called
        })
        it('layers without new separators', () => {
            const layerVisibility = 'layers_visibility'
            const layerOpacity = '0.75'
            const layerTimestamp = 'layers_timestamp'
            exisitingParams.set('layers_visibility', layerVisibility)
            exisitingParams.set('layers_opacity', layerOpacity)
            exisitingParams.set('layers_timestamp', layerTimestamp)
            const param = 'layers'
            const legacyValue = 'ch.bfe.ladebedarfswelt-heimladeverfuegbarkeit_bequem'
            vi.spyOn(utils, 'getLayersFromLegacyUrlParams')

            testHandleLegacyParam(param, legacyValue)

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

            testCameraValues({ z: Number(legacyValue) })
        })
        it('pitch', () => {
            const param = 'pitch'
            const legacyValue = '3'

            testHandleLegacyParam(param, legacyValue)

            testCameraValues({ pitch: Number(legacyValue) })
        })
        it('heading', () => {
            const param = 'heading'
            const legacyValue = '3'

            testHandleLegacyParam(param, legacyValue)

            testCameraValues({ heading: Number(legacyValue) })
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
