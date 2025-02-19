import { type Point, Tooltip, type TooltipModel, type TooltipPosition } from 'chart.js'

function bottomPositioner(
    this: TooltipModel<'line'>,
    _: Element[],
    eventPosition: Point
): TooltipPosition {
    console.log('woot', eventPosition, this.chart.chartArea.bottom)
    const position: TooltipPosition = {
        x: eventPosition.x,
        y: this.chart.chartArea.bottom,
        xAlign: 'center',
        yAlign: 'bottom',
    }
    return position
}
Tooltip.positioners.bottom = bottomPositioner
