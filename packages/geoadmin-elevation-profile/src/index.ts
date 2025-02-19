import { library } from '@fortawesome/fontawesome-svg-core'
import { faClock } from '@fortawesome/free-regular-svg-icons'
import {
    faArrowsAltH,
    faArrowsAltV,
    faChevronDown,
    faChevronUp,
    faDownload,
    faGlobe,
    faMountainSun,
    faSortAmountDownAlt,
    faSortAmountUpAlt,
} from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
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
import { defineCustomElement, type VueElementConstructor } from 'vue'

import AppWrapper from '@/AppWrapper.ce.vue'

import './style.css'

import dataModelPlugin from '@/chartjs-plugins/datamodel.plugin'
import noDataPlugin from '@/chartjs-plugins/nodata.plugin'
import '@/chartjs-plugins/bottom.positioner.ts'
import i18n from '@/i18n'

registerProj4(proj4)

ChartJS.register(CategoryScale, Filler, Legend, LinearScale, LineElement, PointElement, Tooltip)
// registering plugins
ChartJS.register(zoomPlugin)
ChartJS.register(noDataPlugin)
ChartJS.register(dataModelPlugin)

library.add(
    faArrowsAltH,
    faArrowsAltV,
    faChevronDown,
    faChevronUp,
    faClock,
    faDownload,
    faGlobe,
    faMountainSun,
    faSortAmountDownAlt,
    faSortAmountUpAlt
)

const ElevationProfileElement: VueElementConstructor = defineCustomElement(AppWrapper, {
    configureApp(app) {
        app.component('FontAwesomeIcon', FontAwesomeIcon)
        app.use(i18n)
    },
})

customElements.define('geoadmin-elevation-profile', ElevationProfileElement)

export default AppWrapper
