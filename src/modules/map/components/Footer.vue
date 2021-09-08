<template>
    <div id="footer">
        <a
            class="copyright"
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
@import 'src/scss/variables';

#footer {
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    height: $footer-height;
    font-size: 0.6rem;
    padding: 0 0.2rem;
    background: $white;
    text-align: right;
    .copyright {
        // same height as #footer so that text is vertically centered
        line-height: 1.5rem;
    }
}
</style>
