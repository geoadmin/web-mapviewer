import { describe, expect, it } from 'vitest'

import { LayerAttribution } from '@/api/layers/AbstractLayer.class'
import KMLLayer from '@/api/layers/KMLLayer.class'

describe('KMLLayer', () => {
    it('should create a KMLlayer instance with default values', () => {
        const fileId = '-uQyFMtTSCWC_9rZE3EJ6B'
        const kmlFileUrl = `https://sys-public.dev.bgdi.ch/api/kml/files/${fileId}`
        const layer = new KMLLayer(kmlFileUrl)
        expect(layer.kmlFileUrl).toBe(kmlFileUrl)
        expect(layer.visible).toBe(true)
        expect(layer.opacity).toBe(1.0)
        expect(layer.fileId).toBe(fileId)
        expect(layer.adminId).toBe(null)
        expect(layer.isExternal).toBe(false)
        expect(layer.name).toBe('KML')
        expect(layer.hasLegend).toBe(false)
        expect(layer.hasTooltip).toBe(false)

        // Attribution-related tests
        const defaultAttributionName = new URL(kmlFileUrl).hostname
        expect(layer.attributions.length).toBe(1)
        expect(layer.attributions[0]).toBeInstanceOf(LayerAttribution)
        expect(layer.attributions[0].name).toBe(defaultAttributionName)
    })

    it('sopuld create a KMLLayer instance with custom values', () => {
        const fileId = '-uQyFMtTSCWC_9rZE3EJ6B'
        const kmlFileUrl = `https://sys-public.dev.bgdi.ch/api/kml/files/${fileId}`

        const customOpacity = 0.8
        const customVisible = false
        const kmlLayer = new KMLLayer(kmlFileUrl, customVisible, customOpacity)

        expect(kmlLayer.opacity).toBe(customOpacity)
        expect(kmlLayer.visible).toBe(customVisible)
    })

    it('should have correct ID format', () => {
        const fileId = '-uQyFMtTSCWC_9rZE3EJ6B'
        const kmlFileUrl = `https://sys-public.dev.bgdi.ch/api/kml/files/${fileId}`
        const kmlLayer = new KMLLayer(kmlFileUrl)
        const expectedID = `KML|${kmlFileUrl}`
        expect(kmlLayer.getID()).toBe(expectedID)
    })

    it('should identify legacy KML', () => {
        const fileId = '-uQyFMtTSCWC_9rZE3EJ6B'
        const kmlFileUrl = `https://sys-public.dev.bgdi.ch/api/kml/files/${fileId}`
        const legacyKMLLayer = new KMLLayer(kmlFileUrl, null, null, null, null, {
            author: 'legacy-author',
        })
        const modernKMLLayer = new KMLLayer(kmlFileUrl, null, null, null, null, {
            author: 'web-mapviewer',
        })

        expect(legacyKMLLayer.isLegacy()).toBe(true)
        expect(modernKMLLayer.isLegacy()).toBe(false)
    })

    it('should clone KMLLayer instance', () => {
        const mockKmlMetadata = { author: 'web-mapviewer', otherInfo: 'additional metadata' }
        const fileId = '-uQyFMtTSCWC_9rZE3EJ6B'
        const kmlFileUrl = `https://sys-public.dev.bgdi.ch/api/kml/files/${fileId}`
        const originalKMLLayer = new KMLLayer(kmlFileUrl, false, 0.8, null, null, mockKmlMetadata)
        const clonedKMLLayer = originalKMLLayer.clone()

        expect(clonedKMLLayer).not.toBe(originalKMLLayer) // Different instances
        expect(clonedKMLLayer instanceof KMLLayer).toBe(true)
        expect(clonedKMLLayer.name).toBe(originalKMLLayer.name)
        expect(clonedKMLLayer.opacity).toBe(originalKMLLayer.opacity)
        expect(clonedKMLLayer.visible).toBe(originalKMLLayer.visible)

        // Check if kmlMetadata is cloned correctly
        expect(clonedKMLLayer.kmlMetadata).not.toBe(null)
        expect(clonedKMLLayer.kmlMetadata).toEqual(originalKMLLayer.kmlMetadata)
        expect(clonedKMLLayer.kmlMetadata).not.toBe(originalKMLLayer.kmlMetadata) // Should be a new object
    })

    it('should create a KMLLayer instance with local file name', () => {
        const localKMLFile = 'local-file.kml'
        const kmlName = 'Test KML'
        const kmlLayer = new KMLLayer(
            localKMLFile,
            false,
            0.5,
            null,
            `<kml><Document><name>${kmlName}</name></Document></kml>`
        )

        expect(kmlLayer).toBeInstanceOf(KMLLayer)
        expect(kmlLayer.name).toBe(kmlName)
        expect(kmlLayer.opacity).toBe(0.5)
        expect(kmlLayer.visible).toBe(false)
        expect(kmlLayer.isExternal).toBe(true)
        expect(kmlLayer.kmlFileUrl).toBe(localKMLFile)

        // Attribution-related tests
        expect(kmlLayer.attributions.length).toBe(1)
        expect(kmlLayer.attributions[0]).toBeInstanceOf(LayerAttribution)
        expect(kmlLayer.attributions[0].name).toBe(localKMLFile)
    })
})
