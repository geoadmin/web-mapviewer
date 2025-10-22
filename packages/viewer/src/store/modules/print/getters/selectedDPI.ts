import type { PrintStore } from '@/store/modules/print/types/print'

export default function selectedDPI(this: PrintStore): number | undefined {
    const mapAttributes = this.selectedLayout?.attributes.find(
        (attribute) => attribute.name === 'map'
    )
    return mapAttributes?.clientInfo?.maxDPI
}
