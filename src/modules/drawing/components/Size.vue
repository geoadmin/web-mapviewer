<template>
    <div class="setting-container">
        <span>{{ $t('modify_text_size_label') }}:</span>
        <br />
        <div class="dropdown">
            <button
                id="drawing-style-size-selector"
                data-cy="drawing-style-size-selector"
                class="btn btn-primary btn-sm dropdown-toggle dropdown-modification"
                type="button"
                data-bs-toggle="dropdown"
                aria-expanded="false"
            >
                {{ $t(sizeLabel) }}
            </button>
            <ul
                class="dropdown-menu"
                aria-labelledby="drawing-style-size-selector"
                data-cy="size-choices"
            >
                <li>
                    <a
                        v-for="size in sizes"
                        :key="size.label"
                        class="dropdown-item"
                        :data-cy="`drawing-style-size-selector-${size.label}`"
                        @click="() => onChange(size)"
                        >{{ $t(size.label) }}
                    </a>
                </li>
            </ul>
        </div>
    </div>
</template>

<script>
export default {
    components: {},
    props: {
        sizes: {
            type: Array,
            default() {
                return []
            },
        },
        scale: {
            type: Number,
            default: NaN,
        },
    },
    computed: {
        sizeLabel: {
            get: function () {
                const opt = this.sizes.find((s) => s.scale === this.scale)
                return opt ? opt.label : null
            },
        },
    },
    methods: {
        onChange: function (size) {
            this.$emit('sizeChange', size)
        },
    },
}
</script>

<style lang="scss">
.btn.btn-primary.dropdown-toggle.dropdown-modification {
    background-color: white;
    color: black;
    margin-bottom: 5px;
}
</style>
