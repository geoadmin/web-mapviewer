<template>
    <DropdownButton
        :title="$t('export_kml')"
        :current-value="exportSelection"
        :items="exportOptions"
        :disabled="isDrawingEmpty"
        with-toggle-button
        data-cy="drawing-toolbox-export-button"
        @select:item="onExportOptionSelected"
        @click="exportDrawing()"
    />
</template>

<script>
import {
    generateFilename,
    generateGpxString,
    generateKmlString,
} from '@/modules/drawing/lib/export-utils'
import DropdownButton, { DropdownItem } from '@/utils/DropdownButton.vue'
import { saveAs } from 'file-saver'
import { mapState } from 'vuex'

export default {
    components: { DropdownButton },
    inject: ['getDrawingLayer'],
    props: {
        isDrawingEmpty: {
            type: Boolean,
            default: false,
        },
    },
    data() {
        return {
            exportSelection: 'KML',
            exportOptions: [new DropdownItem('KML'), new DropdownItem('GPX')],
        }
    },
    computed: {
        ...mapState({
            projection: (state) => state.position.projection,
        }),
    },
    methods: {
        onExportOptionSelected(dropdownItem) {
            this.exportSelection = dropdownItem.value
            this.exportDrawing()
        },
        exportDrawing() {
            // if there's no features, no export
            if (this.isDrawingEmpty) {
                return
            }

            const gpx = this.exportSelection === 'GPX'

            const features = this.getDrawingLayer().getSource().getFeatures()
            let content, type, fileName
            if (gpx) {
                fileName = generateFilename('.gpx')
                content = generateGpxString(this.projection, features)
                type = 'application/gpx+xml;charset=UTF-8'
            } else {
                fileName = generateFilename('.kml')
                content = generateKmlString(this.projection, features)
                type = 'application/vnd.google-earth.kml+xml;charset=UTF-8'
            }
            const blob = new Blob([content], { type })

            saveAs(blob, fileName)
        },
    },
}
</script>
