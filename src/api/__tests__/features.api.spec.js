// import { expect } from 'chai'
// import Feature from 'ol/Feature.js'
// import Polygon from 'ol/geom/Polygon.js'
// import { describe, it } from 'vitest'

// import { EditableFeature, EditableFeatureTypes } from '@/api/features.api'
// import { MEDIUM, RED } from '@/utils/featureStyleUtils'

// const stringifiedTestObject = `{"id":"drawing_feature_2",\
// "title":"This is a title",\
// "description":"test",\
// "featureType":"ANNOTATION",\
// "textColor":{"name":"red","fill":"#ff0000","border":"#ffffff"},\
// "fillColor":{"name":"red","fill":"#ff0000","border":"#ffffff"},\
// "textSize":{"label":"medium_size","textScale":1.5,"iconScale":1},\
// "icon":null,\
// "iconSize":{"label":"medium_size","textScale":1.5,"iconScale":1}}`

// const coordinates = [
//     [46.50964, 8.06021],
//     [46.9089, 8.4667],
//     [46.96141, 7.78555],
//     [46.50964, 8.06021],
// ]

// const poly = new Polygon([coordinates])
// const testFeature = new Feature({
//     name: 'My Polygon',
//     editableFeature: stringifiedTestObject,
// })
// testFeature.setGeometry(poly)

// const args = {
//     id: 'drawing_feature_2',
//     coordinates: coordinates,
//     title: 'This is a title',
//     featureType: EditableFeatureTypes.ANNOTATION,
// }
// const testObject = {
//     ...args,
//     description: 'test',
//     textColor: RED,
//     textSize: MEDIUM,
//     fillColor: RED,
//     icon: null,
//     iconSize: MEDIUM,
// }
