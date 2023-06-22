import { Credit, ImageryLayer, Rectangle, UrlTemplateImageryProvider } from 'cesium'
import proj4 from 'proj4'
import { WEBMERCATOR, WGS84 } from '@/utils/coordinateSystems'
import { LV95_EXTENT } from '@/config'

const wmtsLayerUrlTemplate =
    'https://wmts.geo.admin.ch/1.0.0/{layer}/default/{timestamp}/3857/{z}/{x}/{y}.{format}'

// todo move in vue component same as it is done for OL
export function addSwisstopoWMTSLayer(viewer, layer, format, maximumLevel, timestamp = 'current') {
    const url = wmtsLayerUrlTemplate
        .replace('{layer}', layer)
        .replace('{timestamp}', timestamp)
        .replace('{format}', format)

    const rectangle = Rectangle.fromDegrees(
        ...proj4(WEBMERCATOR.epsg, WGS84.epsg, [LV95_EXTENT[0], LV95_EXTENT[1]]),
        ...proj4(WEBMERCATOR.epsg, WGS84.epsg, [LV95_EXTENT[2], LV95_EXTENT[3]])
    )
    const imageryLayer = new ImageryLayer(
        new UrlTemplateImageryProvider({
            rectangle: rectangle,
            maximumLevel: maximumLevel,
            credit: new Credit('swisstopo'),
            url: url,
        }),
        {
            show: false,
        }
    )
    viewer.scene.imageryLayers.add(imageryLayer)
    viewer.scene.imageryLayers.lowerToBottom(imageryLayer)

    return imageryLayer
}
