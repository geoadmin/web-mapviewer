import { library } from '@fortawesome/fontawesome-svg-core'
import { faClock } from '@fortawesome/free-regular-svg-icons'
import {
    faArrowsAltH,
    faArrowsAltV,
    faChevronDown,
    faChevronUp,
    faDownload,
    faExclamationTriangle,
    faGlobe,
    faMountainSun,
    faShuffle,
    faSortAmountDownAlt,
    faSortAmountUpAlt,
} from '@fortawesome/free-solid-svg-icons'
import 'chartjs-plugin-zoom'
import { registerProj4 } from '@geoadmin/coordinates'
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
import proj4 from 'proj4'

import dataModelPlugin from '@/chartjs-plugins/datamodel.plugin'
import noDataPlugin from '@/chartjs-plugins/nodata.plugin'
import GeoadminElevationProfile from '@/GeoadminElevationProfile.vue'
import GeoadminElevationProfileCesiumBridge from '@/GeoadminElevationProfileCesiumBridge.vue'
import GeoadminElevationProfileOpenLayersBridge from '@/GeoadminElevationProfileOpenLayersBridge.vue'

registerProj4(proj4)

ChartJS.register(CategoryScale, Filler, Legend, LinearScale, LineElement, PointElement, Tooltip)
ChartJS.register(zoomPlugin, noDataPlugin, dataModelPlugin)

library.add(
    faArrowsAltH,
    faArrowsAltV,
    faChevronDown,
    faChevronUp,
    faClock,
    faDownload,
    faExclamationTriangle,
    faGlobe,
    faMountainSun,
    faShuffle,
    faSortAmountDownAlt,
    faSortAmountUpAlt
)

export {
    GeoadminElevationProfile,
    GeoadminElevationProfileCesiumBridge,
    GeoadminElevationProfileOpenLayersBridge,
}

export default GeoadminElevationProfile
