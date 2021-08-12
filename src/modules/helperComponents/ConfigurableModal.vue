<template>
    <div class="ga-confirmation modal fade show">
        <div class="modal-dialog">
            <div class="modal-content">
                <div v-if="titleTag.length" class="modal-header">
                    <h5 class="modal-title">{{ $t(titleTag) }}</h5>
                    <button type="button" class="close" aria-label="Close" @click="closeModal">
                        <span aria-hidden="true">&times;</span>
                    </button>
                </div>
                <div v-if="hasBodySlot || textTag" class="modal-body">
                    {{ $t(textTag) }}
                    <slot />
                </div>
                <div v-if="showActionButtons" class="modal-footer">
                    <button type="button" class="btn btn-secondary" @click="closeModal">
                        {{ $t(cancelBtnTag) }}
                    </button>
                    <button
                        type="button"
                        class="btn btn-primary"
                        @click="(event) => closeModal(event, true)"
                    >
                        {{ $t(confirmBtnTag) }}
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    props: {
        titleTag: {
            type: String,
            default: '',
        },
        textTag: {
            type: String,
            default: '',
        },
        confirmBtnTag: {
            type: String,
            default: 'success',
        },
        cancelBtnTag: {
            type: String,
            default: 'cancel',
        },
        showActionButtons: {
            type: Boolean,
            default: false,
        },
    },
    computed: {
        hasBodySlot: function () {
            return !!this.$slots.default
        },
    },
    methods: {
        closeModal: function (clickEvent, confirmed) {
            this.$emit('close', confirmed)
        },
    },
}
</script>

<style lang="scss">
.ga-confirmation.modal.show {
    display: block;
    background-color: #00000060;

    .modal-body {
        display: flex;
        border-bottom: 1px solid #dee2e6;
    }

    .modal-footer {
        border-top: none;
    }
}
</style>
