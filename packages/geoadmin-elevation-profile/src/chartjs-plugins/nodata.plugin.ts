import type { Chart, Plugin } from 'chart.js'

import type { ElevationProfile } from '@/profile.api'

export interface NoDataPluginOptions {
    profile: any
    noDataText?: string
}

/**
 * ChartJS plugin that receives the elevation profile as options/parameter.
 *
 * It will then display a gray zone anywhere on the profile chart whenever there is an absence of
 * data (outside LV95 bounds). If the width of the gray rectangle is enough, it will also show a
 * text received as another option ('noDataText', default 'No data')
 */
const noDataPlugin: Plugin = {
    id: 'noData',
    /**
     * @param {ElevationProfile} pluginOptions.profile The elevation profile that is currently shown
     *   on the ChartJS canvas
     * @param {String} pluginOptions.noDataText A text to show to the user inside the rectangle
     *   drawn to signify there is no data for a segment of the profile. If no text is given, it
     *   will fall back to 'No data' in english
     */
    afterDraw(chart: Chart, args, pluginOptions: NoDataPluginOptions) {
        const profile: ElevationProfile = pluginOptions.profile
        const noDataText: string = pluginOptions.noDataText ?? 'No data'

        const {
            ctx,
            chartArea,
            scales: { x },
        } = chart
        const { top, height } = chartArea ?? {}
        // We use right and left from the X axis instead of the chartArea.
        // This way our rects will end on the left and right side of the X axis, and not overlap the Y axis or right empty part of the chart
        const { right, left } = x ?? {}

        // going into each segment without data, to see if we need to draw a no data zone in the chart
        profile.chunks
            .filter((segment) => !segment.hasElevationData)
            .forEach((segmentWithoutData) => {
                const segmentIndex = profile.chunks.indexOf(segmentWithoutData)

                let startingPoint = segmentWithoutData.points[0]
                let endingPoint = segmentWithoutData.points.slice(-1)[0]
                // if this segment isn't the first, we take the last point of the previous segment as our starting point
                if (segmentIndex !== 0) {
                    const previousSegment = profile.chunks[segmentIndex - 1]
                    startingPoint = previousSegment.points.slice(-1)[0]
                }

                // if this segment isn't the last, we take the first point of the next segment as our ending point
                if (segmentIndex < profile.chunks.length - 1) {
                    const nextSegment = profile.chunks[segmentIndex + 1]
                    endingPoint = nextSegment.points[0]
                }

                // calculating where (on the canvas) we should draw our rectangle
                const xStart = Math.max(x.getPixelForValue(startingPoint.dist ?? 0), left)
                const xStop = Math.min(x.getPixelForValue(endingPoint.dist ?? 0), right)
                // checking that the rect we want to draw is visible in the view (when the user has zoomed in, our rect may be out of bounds)
                if ((xStart === left && xStop < left) || (xStop === right && xStart > right)) {
                    return
                }

                // if we made it here, it means we have a rect to draw
                // so let's save the canvas context before modifying it for our purpose
                ctx.save()
                const rectWidth = xStop - xStart

                ctx.fillStyle = 'rgba(0,0,0,0.1)'
                ctx.fillRect(xStart, top, rectWidth, height)

                // if the width of the rect is greater than the size of the noDataText + 5px of margin,
                // we also add a text in the middle to explain why this rect is there
                const fontSize = 11
                ctx.font = `normal 700 ${fontSize}px Unknown, sans-serif`
                if (rectWidth >= ctx.measureText(noDataText).width + 5) {
                    ctx.fillStyle = 'rgba(0,0,0,0.4)'
                    ctx.textAlign = 'center'
                    // placing the text at the exact rect center with a half font size vertical offset
                    const textPosition = {
                        x: xStart + rectWidth / 2.0,
                        y: top + height / 2.0 + fontSize / 2.0,
                    }
                    // first let's draw a back stroke for added visibility
                    ctx.lineWidth = 3
                    ctx.strokeStyle = 'rgba(255,255,255,0.7)'
                    ctx.strokeText(noDataText, textPosition.x, textPosition.y)
                    // and let's draw our text
                    ctx.fillText(noDataText, textPosition.x, textPosition.y)
                }

                // finally, let's restore the canvas at its previous state
                ctx.restore()
            })
    },
}

export default noDataPlugin
