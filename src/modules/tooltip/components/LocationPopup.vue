<template>
    <div v-if="isRightClick" class="location-popup" :style="computedStyle">
        <div class="card">
            <div class="card-header d-flex">
                <span class="flex-grow-1 align-self-center">
                    {{ $t('position') }}
                </span>
                <ButtonWithIcon
                    data-cy="profile-popup-close-button"
                    :button-font-awesome-icon="['fa', 'times']"
                    @click="onClose"
                />
            </div>
            <div class="card-body">
                CH1903+/LV95 Bla bla bla
                {{ clickInfo }}
            </div>
        </div>
    </div>
</template>

<script>
import { mapState } from 'vuex'
import { ClickType } from '@/modules/map/store/map.store'
import ButtonWithIcon from '@/utils/ButtonWithIcon'

export default {
    components: { ButtonWithIcon },
    computed: {
        ...mapState({
            clickInfo: (state) => state.map.clickInfo,
        }),
        isRightClick: function () {
            return this.clickInfo && this.clickInfo.clickType === ClickType.RIGHT_CLICK
        },
        computedStyle: function () {
            return {
                top: `${this.clickInfo.pixelCoordinate[1] + 25}px`,
                left: `${this.clickInfo.pixelCoordinate[0] - 150}px`,
            }
        },
        methods: {
            onClose: function () {
                this.$emit('close')
            },
        },
    },
}
</script>

<style lang="scss">
@import 'src/scss/bootstrap-theme';
.location-popup {
    position: absolute;
    z-index: $zindex-map + 1;
    width: 300px;
    height: auto;
}
</style>
