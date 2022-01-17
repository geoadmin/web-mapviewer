<template>
    <div>
        <label class="form-label" for="drawing-style-text-size-selector">
            {{ $t('modify_text_size_label') }}
        </label>
        <div id="drawing-style-text-size-selector" class="dropdown">
            <button
                id="dropdown-size-selector"
                data-cy="drawing-style-size-selector"
                class="btn btn-light dropdown-toggle"
                type="button"
                data-bs-toggle="dropdown"
                aria-expanded="false"
            >
                {{ $t(sizeLabel) }}
            </button>
            <ul class="dropdown-menu" aria-labelledby="dropdown-size-selector">
                <li>
                    <a
                        v-for="size in sizes"
                        :key="size.label"
                        class="dropdown-item"
                        :class="{ active: currentSize === size }"
                        :data-cy="`drawing-style-size-selector-${size.label}`"
                        @click="onChange(size)"
                    >
                        {{ $t(size.label) }}
                    </a>
                </li>
            </ul>
        </div>
    </div>
</template>

<script>
import DrawingStyleSize, { drawingStyleSizes } from '@/modules/drawing/lib/drawingStyleSizes'

export default {
    props: {
        currentSize: {
            type: DrawingStyleSize,
            required: true,
        },
    },
    emits: ['change'],
    data() {
        return {
            sizes: drawingStyleSizes,
        }
    },
    computed: {
        sizeLabel: function () {
            if (!this.currentSize) {
                return null
            }
            return this.currentSize.label
        },
    },
    methods: {
        onChange: function (size) {
            this.$emit('change', size)
        },
    },
}
</script>
