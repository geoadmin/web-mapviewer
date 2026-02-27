// Methods exposed by specialized interactions
import type Feature from 'ol/Feature'

export interface DrawingInteractionExposed {
    removeLastPoint: () => void
}

// Methods exposed by the select interaction component
export interface SelectInteractionExposed extends DrawingInteractionExposed {
    setActive: (_: boolean) => void
    selectFeature: (_: Feature | undefined) => void
}
