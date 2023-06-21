import { Rectangle } from 'cesium'

export const SWITZERLAND_BOUNDS = [5.140242, 45.398181, 11.47757, 48.230651]

export const SWITZERLAND_RECTANGLE = Rectangle.fromDegrees(...SWITZERLAND_BOUNDS)

export const CARTOGRAPHIC_LIMIT_RECTANGLE = Rectangle.fromDegrees(
    5.86725126512748,
    45.8026860136571,
    10.9209100671547,
    47.8661652478939
)
