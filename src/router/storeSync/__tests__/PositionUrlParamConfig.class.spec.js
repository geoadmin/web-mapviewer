import PositionUrlParamConfig from '@/router/storeSync/PositionUrlParamConfig.class'
import { beforeEach, describe, expect, it, vi } from 'vitest'

describe('PositionUrlParamConfig class test', () => {
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
                        yaw: 0,
                        roll: 0,
                    },
                },
                ui: {
                    showIn3d: false,
                },
            },
            getters: {
                centerEpsg4326: [0, 0],
            },
            dispatch: vi.fn().mockImplementation((actionName) => {}),
        }
    })

    describe('writing the query', () => {
        describe('2D', () => {
            it('writes all 2D parameters correctly', () => {
                let query = {}
                const lon = 123,
                    lat = 456,
                    zoom = 999
                fakeStore.state.position.zoom = zoom
                fakeStore.getters.centerEpsg4326 = [lon, lat]
                testInstance.populateQueryWithStoreValue(query, fakeStore)
                expect(query).to.haveOwnProperty('lat')
                expect(query).to.haveOwnProperty('lon')
                expect(query).to.haveOwnProperty('z')
                expect(query.lon).to.eq(`${lon}`)
                expect(query.lat).to.eq(`${lat}`)
                expect(query.z).to.eq(`${zoom}`)
            })
            it('does not write the 3D parameters along', () => {
                let query = {}
                fakeStore.state.position.zoom = 789
                fakeStore.state.position.camera = {
                    x: 99,
                    y: 99,
                    z: 99,
                    pitch: 99,
                    yaw: 99,
                    roll: 99,
                }
                fakeStore.getters.centerEpsg4326 = [123, 456]
                testInstance.populateQueryWithStoreValue(query, fakeStore)
                expect(query).to.not.haveOwnProperty('camera')
            })
            it('removes 3D related params if they are found while 3D is inactive', () => {
                let query = {
                    camera: '99,99,99,99,99,99',
                }
                testInstance.populateQueryWithStoreValue(query, fakeStore)
                expect(query).to.not.haveOwnProperty('camera')
            })
        })
        describe('3D', () => {
            const camera = {
                x: 12,
                y: 34,
                z: 56,
                pitch: 78,
                yaw: 90,
                roll: 49,
            }
            beforeEach(() => {
                fakeStore.state.ui.showIn3d = true
                fakeStore.state.position.camera = camera
            })
            it('writes all 3D parameters correctly', () => {
                let query = {}
                testInstance.populateQueryWithStoreValue(query, fakeStore)
                expect(query).to.haveOwnProperty('camera')
                expect(query.camera).to.eq(
                    `${camera.x},${camera.y},${camera.z},${camera.pitch},${camera.yaw},${camera.roll}`
                )
            })
            it('does not write 2D parameters along', () => {
                let query = {}
                fakeStore.getters.centerEpsg4326 = [99, 99]
                fakeStore.state.position.zoom = 99
                testInstance.populateQueryWithStoreValue(query, fakeStore)
                expect(query).to.not.haveOwnProperty('lat')
                expect(query).to.not.haveOwnProperty('lon')
                expect(query).to.not.haveOwnProperty('z')
            })
            it('removes any 2D parameters present in the query if 3D is active', () => {
                let query = { lon: '99', lat: '99', z: '99' }
                testInstance.populateQueryWithStoreValue(query, fakeStore)
                expect(query).to.not.haveOwnProperty('lat')
                expect(query).to.not.haveOwnProperty('lon')
                expect(query).to.not.haveOwnProperty('z')
            })
        })
    })
    describe('setting/dispatching the store', () => {
        describe('2D', () => {
            it('dispatches 2D params correctly to the store', () => {
                testInstance.populateStoreWithQueryValue(fakeStore, { lon: 123, lat: 456, z: 789 })
                expect(fakeStore.dispatch).toHaveBeenCalledTimes(3)
                fakeStore.dispatch.mock.calls.forEach((call) => {
                    expect(call).to.include.oneOf(['setLongitude', 'setLatitude', 'setZoom'])
                })
            })
            it('does not dispatch 3D related actions', () => {
                testInstance.populateStoreWithQueryValue(fakeStore, {
                    lon: `${fakeStore.getters.centerEpsg4326[0]}`,
                    lat: `${fakeStore.getters.centerEpsg4326[1]}`,
                    z: `${fakeStore.state.position.zoom}`,
                    camera: '1,2,3,4,5,6',
                })
                expect(fakeStore.dispatch).toHaveBeenCalledTimes(0)
            })
            it('does not dispatch 2D param absent from the query', () => {
                testInstance.populateStoreWithQueryValue(fakeStore, { lat: 456, z: 789 })
                expect(fakeStore.dispatch).toHaveBeenCalledTimes(2)
                fakeStore.dispatch.mock.calls.forEach((call) => {
                    expect(call).to.include.oneOf(['setLatitude', 'setZoom'])
                })
            })
        })
        describe('3D', () => {
            beforeEach(() => {
                fakeStore.state.ui.showIn3d = true
            })
            it('dispatches 3D param correctly to the store', () => {
                testInstance.populateStoreWithQueryValue(fakeStore, { camera: '1,2,3,4,5,6' })
                expect(fakeStore.dispatch).toHaveBeenCalledOnce()
                expect(fakeStore.dispatch.mock.calls[0]).to.include.members(['setCameraPosition'])
            })
            it('does not dispatch 2D related actions', () => {
                testInstance.populateStoreWithQueryValue(fakeStore, {
                    lon: `${fakeStore.getters.centerEpsg4326[0]}`,
                    lat: `${fakeStore.getters.centerEpsg4326[1]}`,
                    z: `${fakeStore.state.position.zoom}`,
                })
                expect(fakeStore.dispatch).toHaveBeenCalledTimes(0)
            })
        })
    })
    describe('valuesAreDifferentBetweenQueryAndStore', () => {
        describe('2D', () => {
            const defaultLon = 123
            const defaultLat = 456
            const defaultZoom = 3
            const generateQuery = (lon = defaultLon, lat = defaultLat, zoom = defaultZoom) => {
                return {
                    lon: `${lon}`,
                    lat: `${lat}`,
                    z: `${zoom}`,
                }
            }
            beforeEach(() => {
                fakeStore.getters.centerEpsg4326 = [defaultLon, defaultLat]
                fakeStore.state.position.zoom = defaultZoom
            })
            it('detects correctly that longitude has changed', () => {
                expect(
                    testInstance.valuesAreDifferentBetweenQueryAndStore(
                        generateQuery(defaultLon + 1),
                        fakeStore
                    )
                ).to.be.true
            })
            it('detects correctly that longitude is the same', () => {
                expect(
                    testInstance.valuesAreDifferentBetweenQueryAndStore(generateQuery(), fakeStore)
                ).to.be.false
            })
            it('detects correctly that latitude has changed', () => {
                expect(
                    testInstance.valuesAreDifferentBetweenQueryAndStore(
                        generateQuery(defaultLon, defaultLat + 1),
                        fakeStore
                    )
                ).to.be.true
            })
            it('detects correctly that latitude is the same', () => {
                expect(
                    testInstance.valuesAreDifferentBetweenQueryAndStore(generateQuery(), fakeStore)
                ).to.be.false
            })
            it('detects correctly that zoom has changed', () => {
                expect(
                    testInstance.valuesAreDifferentBetweenQueryAndStore(
                        generateQuery(defaultLon, defaultLat, defaultZoom + 1),
                        fakeStore
                    )
                ).to.be.true
            })
            it('detects correctly that zoom is the same', () => {
                expect(
                    testInstance.valuesAreDifferentBetweenQueryAndStore(generateQuery(), fakeStore)
                ).to.be.false
            })
        })
        describe('3D', () => {
            beforeEach(() => {
                fakeStore.state.ui.showIn3d = true
                fakeStore.state.position.camera = {
                    x: 1,
                    y: 1,
                    z: 1,
                    pitch: 1,
                    yaw: 1,
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
})
