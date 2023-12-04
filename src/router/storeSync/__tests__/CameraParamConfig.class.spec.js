import { beforeEach, describe, expect, it, vi } from 'vitest'

import PositionUrlParamConfig, {
    readCameraFromUrlParam,
} from '@/router/storeSync/CameraParamConfig.class'

describe('CameraParamConfig class test', () => {
    const testInstance = new PositionUrlParamConfig()
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
            dispatch: vi.fn().mockImplementation((_actionName) => {}),
        }
    })

    describe('reading the query (readCameraFromUrlParam)', () => {
        const expectedCamera = {
            x: 123,
            y: 456,
            z: 99,
            pitch: 777,
            heading: 888,
            roll: 789,
        }
        const generateCameraString = (x, y, z, pitch, heading, roll) => {
            return `${x},${y},${z},${pitch},${heading},${roll}`
        }
        const testCameraValues = (camera, expectedCamera) => {
            expect(camera).to.be.an('Object')
            expect(camera).to.haveOwnProperty('x')
            expect(camera).to.haveOwnProperty('y')
            expect(camera).to.haveOwnProperty('z')
            expect(camera).to.haveOwnProperty('pitch')
            expect(camera).to.haveOwnProperty('heading')
            expect(camera).to.haveOwnProperty('roll')
            expect(camera.x).to.eq(expectedCamera.x)
            expect(camera.y).to.eq(expectedCamera.y)
            expect(camera.z).to.eq(expectedCamera.z)
            expect(camera.pitch).to.eq(expectedCamera.pitch)
            expect(camera.heading).to.eq(expectedCamera.heading)
            expect(camera.roll).to.eq(expectedCamera.roll)
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
            expect(result).to.be.an('Object')
            testCameraValues(result, expectedCamera)
        })
        it('fills any empty camera value with 0s', () => {
            const result = readCameraFromUrlParam(
                generateCameraString(expectedCamera.x, '', expectedCamera.z, '', '', '')
            )
            expect(result).to.be.an('Object')
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
        const camera = {
            x: 12,
            y: 34,
            z: 56,
            pitch: 78,
            heading: 90,
            roll: 49,
        }
        beforeEach(() => {
            fakeStore.state.cesium.active = true
            fakeStore.state.position.camera = camera
        })
        it('writes all 3D parameters correctly', () => {
            let query = {}
            testInstance.populateQueryWithStoreValue(query, fakeStore)
            expect(query).to.haveOwnProperty('camera')
            expect(query.camera).to.eq(
                `${camera.x},${camera.y},${camera.z},${camera.pitch},${camera.heading},${camera.roll}`
            )
        })
        it('writes nothing if the value of a param is equal to zero', () => {
            camera.y = 0
            camera.pitch = 0
            let query = {}
            testInstance.populateQueryWithStoreValue(query, fakeStore)
            expect(query).to.haveOwnProperty('camera')
            expect(query.camera).to.eq(`${camera.x},,${camera.z},,${camera.heading},${camera.roll}`)
        })
    })
    describe('setting/dispatching the store', () => {
        beforeEach(() => {
            fakeStore.state.cesium.active = true
        })
        it('dispatches 3D param correctly to the store', () => {
            testInstance.populateStoreWithQueryValue(fakeStore, '1,2,3,4,5,6')
            expect(fakeStore.dispatch).toHaveBeenCalledOnce()
            expect(fakeStore.dispatch.mock.calls[0]).to.include.members(['setCameraPosition'])
        })
    })
    describe('valuesAreDifferentBetweenQueryAndStore', () => {
        beforeEach(() => {
            fakeStore.state.cesium.active = true
            fakeStore.state.position.camera = {
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
                    testInstance.valuesAreDifferentBetweenQueryAndStore(
                        {
                            camera: cameraString,
                        },
                        fakeStore
                    ),
                    `this camera string was interpreted as being equals to "1,1,1,1,1,1" : ${cameraString}`
                ).to.be.true
            }
            testInstance.valuesAreDifferentBetweenQueryAndStore({}, fakeStore)
        })
        it('detects correctly when the values are the same', () => {
            expect(
                testInstance.valuesAreDifferentBetweenQueryAndStore(
                    { camera: '1,1,1,1,1,1' },
                    fakeStore
                )
            ).to.be.false
        })
    })
})
