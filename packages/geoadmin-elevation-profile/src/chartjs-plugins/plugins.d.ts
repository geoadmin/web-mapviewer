import { ChartType } from 'chart.js'

import type { DataModelPluginOptions } from '@/chartjs-plugins/datamodel.plugin'
import type { NoDataPluginOptions } from '@/chartjs-plugins/nodata.plugin'

declare module 'chart.js' {
    interface PluginOptionsByType<TType extends ChartType> {
        noData?: NoDataPluginOptions<TType>
        dataModel?: DataModelPluginOptions<TType>
    }
}
