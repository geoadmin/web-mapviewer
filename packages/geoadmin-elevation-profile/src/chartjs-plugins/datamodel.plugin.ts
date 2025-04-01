import type { Plugin } from 'chart.js'

export type DataModelPluginOptions = {
    /**
     * Name of the data model that will be written in the top right corner of the chart. Defaults to
     * 'swissALTI3D/DHM25'
     */
    dataModelName?: string
}

/**
 * Small ChartJS plugin that will add the data model used by the chart in the top right corner of
 * that chart if the chart is wide enough.
 *
 * It will not add it if the text for the data model exceeds 33% of the available space
 */
const dataModelPlugin: Plugin = {
    id: 'dataModel',
    afterDraw(chart, _, pluginOptions: DataModelPluginOptions) {
        const dataModelName: string = pluginOptions.dataModelName ?? 'swissALTI3D/DHM25'
        const { ctx, chartArea } = chart
        const { top = 0, width = 0, right = 0 } = chartArea ?? {}

        ctx.save()
        ctx.font = 'normal 700 12px Unknown, sans-serif'
        // Checking if there is enough space to write the text.
        // We do not show it if it takes more than a third of the width of the chart (i.e., on mobile)
        if (ctx.measureText(dataModelName).width <= width / 3.0) {
            ctx.textAlign = 'right'
            ctx.fillStyle = '#000'
            ctx.strokeStyle = '#fff'
            ctx.lineWidth = 1
            ctx.strokeText(dataModelName, right - 5, top + 15)
            ctx.fillText(dataModelName, right - 5, top + 15)
        }
        ctx.restore()
    },
}

export default dataModelPlugin
