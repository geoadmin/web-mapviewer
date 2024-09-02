//Taken from an example on the openlayers website about kmz drag and drop
//https://openlayers.org/en/latest/examples/drag-and-drop-custom-kmz.html

import JSZip from 'jszip'

import KML from '@/utils/ol/format/KML'

// Create functions to extract KML and icons from KMZ array buffer,
// which must be done synchronously.

const zip = new JSZip()

export async function getKMLData(buffer) {
    let kml = await zip.loadAsync(buffer).then(function (content) {
        console.error('content: ', content)
        const kmlFile = content.file(/\.kml$/i)[0]
        if (kmlFile) {
            console.error('kmlFile: ', kmlFile)
            let text = kmlFile.async('string').then(function (read) {
                console.error('content: ', read)
                return read
            })
            return text
        }
    })
    return kml
}

export function getKMLImage(href) {
    //console.error('href: ', href)
    if (window.location.href.lastIndexOf('/') !== -1) {
        const kmlFile = zip.file(href.split('/').pop())
        //console.error('kmlFile: ', kmlFile)
        if (kmlFile) {
            return URL.createObjectURL(new Blob([kmlFile.asArrayBuffer()]))
        }
    }
    return href
}
// Define a KMZ format class by subclassing ol/format/KML

class KMZ extends KML {
    constructor(opt_options) {
        const options = opt_options || {}
        options.iconUrlFunction = getKMLImage
        super(options)
        this.kmlData = null
        this.iconUrlFunction = options.iconUrlFunction
    }

    getType() {
        return 'arraybuffer'
    }

    readFeature(source, options) {
        const kmlData = getKMLData(source)
        this.kmlData = kmlData
        return super.readFeature(kmlData, options)
    }

    readFeatures(source, options) {
        const kmlData = getKMLData(source)
        this.kmlData = kmlData
        //Promise.all([kmlData]).then((values) => {
        //    console.error('kmlData: ', values)
        //    this.kmlData = values
        //    return super.readFeatures(values, options)
        //})
        return super.readFeatures(kmlData, options)
    }
}

export default KMZ
