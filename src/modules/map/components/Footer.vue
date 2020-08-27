<template>
  <div id="footer">
    <a :href="`https://www.geo.admin.ch/${$i18n.locale}/about-swiss-geoportal/impressum.html#copyright`" target="_blank">
      {{ $t('copyright_label') }}
    </a>
  </div>
</template>

<style>
  #footer {
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 15px;
    font-size: 12px;
    padding: 0 5px;
    background: white;
  }
</style>

<script>
  export default {
  }
</script>