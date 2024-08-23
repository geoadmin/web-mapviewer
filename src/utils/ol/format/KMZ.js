//Taken from an example on the openlayers website about kmz drag and drop
//https://openlayers.org/en/latest/examples/drag-and-drop-custom-kmz.html

import JSZip from 'jszip'

import KML from '@/utils/ol/format/KML'

// Create functions to extract KML and icons from KMZ array buffer,
// which must be done synchronously.

const zip = new JSZip()

export function getKMLData(buffer) {
    let kmlData
    zip.load(buffer)
    const kmlFile = zip.file(/\.kml$/i)[0]
    //console.error('kmlFile: ', kmlFile)
    if (kmlFile) {
        kmlData = kmlFile.asText()
    }
    //console.error('kmlData: ', kmlData)
    return kmlData
}

export function getKMLImage(href) {
    console.error('href: ', href)
    const index = window.location.href.lastIndexOf('/') - 2
    if (index !== -1) {
        const kmlFile = zip.file(href.slice(index + 1))
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
        return super.readFeatures(kmlData, options)
    }
}

export default KMZ
