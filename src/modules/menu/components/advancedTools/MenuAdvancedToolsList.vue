<template>
    <ul class="advanced-tools-list px-2 py-1">
        <li class="advanced-tools-item">
            <a
                class="advanced-tools-title"
                :class="{ 'text-primary': importOverlay }"
                :title="$t('import_tooltip')"
                data-cy="menu-import-tool"
                @click.stop="onToggleImportOverlay"
                >{{ $t('import') }}</a
            >
        </li>
    </ul>
</template>

<script>
import { mapActions, mapState, mapGetters } from 'vuex'

export default {
    computed: {
        ...mapState({ importOverlay: (state) => state.ui.importOverlay }),
        ...mapGetters(['isPhoneMode']),
    },
    methods: {
        ...mapActions(['toggleImportOverlay', 'toggleMenu']),
        onToggleImportOverlay() {
            if (!this.importOverlay && this.isPhoneMode) {
                // To avoid the menu overlapping the import overlay after open we automatically
                // close the menu
                this.toggleMenu()
            }
            this.toggleImportOverlay()
        },
    },
}
</script>

<style lang="scss" scoped>
.advanced-tools-list {
    list-style-type: none;
    margin-bottom: 0;

    .advanced-tools-item {
        .advanced-tools-title {
            display: block;
            color: black;
            text-decoration: none;
            cursor: pointer;
            border-bottom-width: 1px;
            border-bottom-style: solid;
            border-bottom-color: #e9e9e9;
            height: 2.75em;
            line-height: 2.75em;
        }
        .advanced-tools-title:hover,
        .advanced-tools-title:focus {
            color: #666;
        }
    }
}
</style>
