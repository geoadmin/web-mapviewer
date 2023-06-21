import { Credit, ImageryLayer, UrlTemplateImageryProvider } from 'cesium'
import { SWITZERLAND_RECTANGLE } from '@/modules/map/components/cesium/constants'

const wmtsLayerUrlTemplate =
    'https://wmts.geo.admin.ch/1.0.0/{layer}/default/{timestamp}/3857/{z}/{x}/{y}.{format}'

export function addSwisstopoWMTSLayer(viewer, layer, format, maximumLevel, timestamp = 'current') {
    const url = wmtsLayerUrlTemplate
        .replace('{layer}', layer)
        .replace('{timestamp}', timestamp)
        .replace('{format}', format)

    const imageryLayer = new ImageryLayer(
        new UrlTemplateImageryProvider({
            rectangle: SWITZERLAND_RECTANGLE,
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
