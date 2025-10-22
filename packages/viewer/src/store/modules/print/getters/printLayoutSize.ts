import type { PrintLayoutSize, PrintStore } from '@/store/modules/print/types/print'

export default function printLayoutSize(this: PrintStore): PrintLayoutSize {
    const mapAttributes = this.selectedLayout?.attributes.find(
        (attribute) => attribute.name === 'map'
    )

    const params = mapAttributes?.clientParams

    if (!params) {
        return { width: 0, height: 0 }
    }

    type size = { default: number }

    return {
        width: (params.width as size).default ?? 0,
        height: (params.height as size).default ?? 0,
    }
}
