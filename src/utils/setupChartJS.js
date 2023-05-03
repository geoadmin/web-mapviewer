import dataModel from '@/utils/chartjs-datamodel.plugin'
import noDataPlugin from '@/utils/chartjs-nodata.plugin'
import {
    CategoryScale,
    Chart as ChartJS,
    Filler,
    Legend,
    LinearScale,
    LineElement,
    PointElement,
    Tooltip,
} from 'chart.js'
import zoomPlugin from 'chartjs-plugin-zoom'

export default function setupChartJS() {
    ChartJS.register(CategoryScale, Filler, Legend, LinearScale, LineElement, PointElement, Tooltip)
    // registering plugins
    ChartJS.register(zoomPlugin)
    ChartJS.register(noDataPlugin)
    ChartJS.register(dataModel)
}
