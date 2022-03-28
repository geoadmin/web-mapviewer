import { DrawingModes } from '@/modules/store/modules/drawing.store'
import { MEDIUM, RED } from '@/utils/featureStyleUtils'
import GeometryType from 'ol/geom/GeometryType'
import { drawLineStyle, drawMeasureStyle } from './style'

export default [
    {
        drawingMode: DrawingModes.LINEPOLYGON,
        geomType: GeometryType.POLYGON,
        drawOptions: {
            minPoints: 2,
            style: drawLineStyle,
        },
        properties: {
            color: RED.fill,
            description: '',
        },
    },
    {
        drawingMode: DrawingModes.MARKER,
        geomType: GeometryType.POINT,
        // These properties need to be evaluated later as the
        // availableIconSets aren't ready when this component is mounted.
        properties: (availableIconSets) => {
            const defaultIconSet = availableIconSets.find((set) => set.name === 'default')
            const defaultIcon = defaultIconSet.icons[0]

            return {
                color: RED.fill,
                font: MEDIUM.font,
                icon: defaultIcon,
                iconUrl: defaultIcon.generateURL(),
                anchor: defaultIcon.anchor,
                text: '',
                description: '',
                textScale: MEDIUM.textScale,
            }
        },
    },
    {
        drawingMode: DrawingModes.MEASURE,
        geomType: GeometryType.POLYGON,
        drawOptions: {
            minPoints: 2,
            style: drawMeasureStyle,
        },
        properties: {
            color: RED.fill,
        },
    },
    {
        drawingMode: DrawingModes.ANNOTATION,
        geomType: GeometryType.POINT,
        properties: {
            color: RED.fill,
            text: 'new text',
            font: MEDIUM.font,
            textScale: MEDIUM.textScale,
        },
    },
]
