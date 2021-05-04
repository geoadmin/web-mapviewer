<template>
    <div v-if="feature" class="card drawing-style-popup">
        <div class="card-header">
            <span class="float-left">{{ $t('draw_popup_title_feature') }}</span>
            <span class="float-right mx-2" @click="onClose">
                <font-awesome-icon :icon="['fa', 'times']" />
            </span>
        </div>
        <div class="card-body p-0 text-left">
            <form class="p-4">
                <div class="form-group">
                    <label for="text">{{ $t('draw_popup_title_annotation') }}</label>
                    <textarea
                        id="text"
                        class="form-control"
                        rows="2"
                        :value="feature.properties.text"
                        @input="updateProperties"
                    ></textarea>
                </div>
                <div class="form-group">
                    <label for="description">{{ $t('modify_description') }}</label>
                    <textarea
                        id="description"
                        class="form-control"
                        rows="3"
                        :value="feature.properties.description"
                        @input="updateProperties"
                    ></textarea>
                </div>
                <div class="form-group">
                    <button type="button" class="btn float-right" @click="onDelete">
                        <font-awesome-icon :icon="['far', 'trash-alt']" />
                    </button>
                </div>
            </form>
        </div>
    </div>
</template>

<script>
export default {
    props: {
        feature: {
            type: Object,
            default: null,
        },
    },
    computed: {},
    methods: {
        onClose: function () {
            this.$emit('close', this.feature.id)
        },
        onDelete: function () {
            this.$emit('delete', this.feature.id)
        },
        updateProperties: function () {
            this.$emit('updateProperties', this.feature.properties)
        },
    },
}
</script>

<style>
.drawing-style-popup {
    position: absolute;
    z-index: 1000;
}
</style>
