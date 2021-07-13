<template>
    <div class="setting-container">
        <span>{{ $t('modify_text_size_label') }}:</span>
        <br />
        <div class="btn-group">
            <button
                data-cy="size-button"
                class="btn btn-primary btn-sm dropdown-toggle dropdown-modification"
                type="button"
                data-toggle="dropdown"
                aria-haspopup="true"
                aria-expanded="false"
            >
                {{ $t(sizeLabel) }}
            </button>
            <div class="dropdown-menu" data-cy="size-choices">
                <a
                    v-for="size in sizes"
                    :key="size.label"
                    href="#"
                    class="dropdown-item"
                    @click="() => onChange(size)"
                    >{{ $t(size.label) }}
                </a>
            </div>
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
