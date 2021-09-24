<template>
    <div id="footer" class="d-flex">
        <portal-target multiple class="flex-grow-1 d-flex align-items-center" name="footer" />
        <a
            class="copyright align-self-center"
            :href="`https://www.geo.admin.ch/${$i18n.locale}/about-swiss-geoportal/impressum.html#copyright`"
            target="_blank"
        >
            {{ $t('copyright_label') }}
        </a>
    </div>
</template>

<script>
export default {}
</script>

<style lang="scss">
@import 'src/scss/bootstrap-theme';

#footer {
    position: absolute;
    bottom: 0;
    left: 0;
    z-index: $zindex-footer;
    width: 100%;
    height: $footer-height;
    font-size: 0.6rem;
    padding: 0 0.2rem;
    background: $white;
}
</style>
