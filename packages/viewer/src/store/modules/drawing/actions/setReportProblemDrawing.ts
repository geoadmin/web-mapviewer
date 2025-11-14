import type { DrawingStore } from '@/store/modules/drawing/types/drawing'
import type { ActionDispatcher } from '@/store/types'

export default function setReportProblemDrawing(
    this: DrawingStore,
    isReportProblemDrawing: boolean,
    dispatcher: ActionDispatcher
) {
    this.reportProblemDrawing = isReportProblemDrawing
}
