import type { RouteLocationNormalizedGeneric } from 'vue-router'

import { createTestingPinia } from '@pinia/testing'
import { mount } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, expectTypeOf, it, vi } from 'vitest'

import type { CesiumStore } from '@/store/modules/cesium/types/cesium'
import type { CameraPosition, PositionStore } from '@/store/modules/position/types/position'

import cameraParam, {
    readCameraFromUrlParam,
} from '@/router/storeSync/params/camera.param'
import useCesiumStore from '@/store/modules/cesium'
import usePositionStore from '@/store/modules/position'

describe('CameraParamConfig class test', () => {
    const testInstance = cameraParam
    let fakeTo: RouteLocationNormalizedGeneric
    let wrapper: ReturnType<typeof mount>
    let cesiumStore: CesiumStore
    let positionStore: PositionStore
    beforeEach(() => {
        // Create a fresh pinia instance for each test
        wrapper = mount(testInstance, {
            global: {
                plugins: [createTestingPinia({
                    createSpy: vi.fn
                })],
            },
        })

        // Reset the stores to their initial state
        cesiumStore = useCesiumStore()
        positionStore = usePositionStore()

        cesiumStore.$reset()
        positionStore.$reset()

        fakeTo = { query: {} } as RouteLocationNormalizedGeneric
    })
    afterEach(() => {
        wrapper.unmount()
    })

    describe('reading the query (readCameraFromUrlParam)', () => {
        const expectedCamera: CameraPosition = {
            x: 123,
            y: 456,
            z: 99,
            pitch: 777,
            heading: 888,
            roll: 789,
        }
        const generateCameraString = (
            x: number,
            y: number | string,
            z: number,
            pitch: number | string,
            heading: number | string,
            roll: number | string
        ) => {
            return `${x},${y},${z},${pitch},${heading},${roll}`
        }
        const testCameraValues = (
            camera: CameraPosition | undefined,
            expectedCamera: CameraPosition
        ) => {
            expectTypeOf(camera).toEqualTypeOf<CameraPosition | undefined>()
            expect(camera?.x).to.eq(expectedCamera.x)
            expect(camera?.y).to.eq(expectedCamera.y)
            expect(camera?.z).to.eq(expectedCamera.z)
            expect(camera?.pitch).to.eq(expectedCamera.pitch)
            expect(camera?.heading).to.eq(expectedCamera.heading)
            expect(camera?.roll).to.eq(expectedCamera.roll)
        }
        it('reads 3D URL param correctly', () => {
            const result = readCameraFromUrlParam(
                generateCameraString(
                    expectedCamera.x,
                    expectedCamera.y,
                    expectedCamera.z,
                    expectedCamera.pitch,
                    expectedCamera.heading,
                    expectedCamera.roll
                )
            )
            expect(result).to.not.be.undefined
            testCameraValues(result, expectedCamera)
        })
        it('fills any empty camera value with 0s', () => {
            const result = readCameraFromUrlParam(
                generateCameraString(expectedCamera.x, '', expectedCamera.z, '', '', '')
            )
            expect(result).to.not.be.undefined
            testCameraValues(result, {
                x: expectedCamera.x,
                y: 0,
                z: expectedCamera.z,
                pitch: 0,
                heading: 0,
                roll: 0,
            })
        })
    })
    describe('writing the query', () => {
        const camera: CameraPosition = {
            x: 12,
            y: 34,
            z: 56,
            pitch: 78,
            heading: 90,
            roll: 49,
        }
        beforeEach(() => {
            cesiumStore.active = true
            positionStore.camera = camera
        })
        it('writes all 3D parameters correctly', () => {
            const query = {}
            testInstance.populateQueryWithStoreValue(query)
            expect(query).to.haveOwnProperty('camera')
            expect((query as {
                camera: string
            }).camera).to.eq(
                `${camera.x},${camera.y},${camera.z},${camera.pitch},${camera.heading},${camera.roll}`
            )
        })
        it('writes nothing if the value of a param is equal to zero', () => {
            positionStore.camera = {
                ...camera,
                y: 0,
                pitch: 0,
            }

            const query = {}
            testInstance.populateQueryWithStoreValue(query)
            expect(query).to.haveOwnProperty('camera')
            expect((query as {
                camera: string
            }).camera).to.eq(
                `${camera.x},,${camera.z},,${camera.heading},${camera.roll}`
            )
        })
    })
    describe('setting/dispatching the store', () => {
        beforeEach(() => {
            cesiumStore.active = true
        })
        it('dispatches 3D param correctly to the store', () => {

            // Mock the action to prevent infinite recursion
            // positionStore.setCameraPosition = vi.fn()
            testInstance.populateStoreWithQueryValue(fakeTo, '1,2,3,4,5,6')
            // Verify the action was called with the correct camera position
            expect(positionStore.setCameraPosition).toHaveBeenCalledWith(
                {
                    x: 1,
                    y: 2,
                    z: 3,
                    pitch: 4,
                    heading: 5,
                    roll: 6,
                },
                expect.anything()
            )
        })
    })
    describe('valuesAreDifferentBetweenQueryAndStore', () => {
        beforeEach(() => {
            cesiumStore.active = true
            positionStore.camera = {
                x: 1,
                y: 1,
                z: 1,
                pitch: 1,
                heading: 1,
                roll: 1,
            }
        })
        it('detects correctly that the camera param has changed', () => {
            const cameraStringCorrespondingToStore = '1,1,1,1,1,1'
            for (let i = 0; i < 5; i++) {
                // placing 2 instead of 1 in each slot consecutively (so that we may test all combinations)
                const cameraString =
                    cameraStringCorrespondingToStore.substring(0, i * 2) +
                    '2' +
                    cameraStringCorrespondingToStore.substring(i * 2 + 1)
                expect(
                    testInstance.valuesAreDifferentBetweenQueryAndStore({
                        camera: cameraString,
                    }),
                    `this camera string was interpreted as being equals to "1,1,1,1,1,1" : ${cameraString}`
                ).to.be.true
            }
            testInstance.valuesAreDifferentBetweenQueryAndStore({})
        })
        it('detects correctly when the values are the same', () => {
            expect(
                testInstance.valuesAreDifferentBetweenQueryAndStore({ camera: '1,1,1,1,1,1' })
            ).to.be.false
        })
    })
})
