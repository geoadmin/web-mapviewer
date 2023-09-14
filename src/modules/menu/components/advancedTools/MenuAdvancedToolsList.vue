<template>
    <ul class="advanced-tools-list">
        <li class="advanced-tools-item">
            <a
                class="advanced-tools-title"
                :title="$t('import_tooltip')"
                @click.stop="onToggleOverlay"
                >{{ $t('import') }}</a
            >
        </li>
    </ul>
</template>

<script>
import { mapActions } from 'vuex'

export default {
    methods: {
        ...mapActions(['toggleImportOverlay']),
        onToggleOverlay() {
            this.toggleImportOverlay()
        },
    },
}
</script>

<style lang="scss" scoped>
.advanced-tools-list {
    list-style-type: none;
    padding: 4px 4px 4px 7px;
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
