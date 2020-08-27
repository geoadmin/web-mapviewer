<template>
    <div id="app">
        <MapModule></MapModule>
        <ToolboxModule></ToolboxModule>
        <I18nModule></I18nModule>
    </div>
</template>

<script>
    import MapModule from "./modules/map/";
    import ToolboxModule from "./modules/toolbox/";
    import I18nModule from "./modules/i18n/I18nModule";

    export default {
        name: 'App',
        components: {
            MapModule,
            ToolboxModule,
            I18nModule
        }
    }
</script>

<style lang="scss">
    #app {
        font-family: Avenir, Helvetica, Arial, sans-serif;
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
        text-align: center;
        color: #2c3e50;
        margin-top: 60px;
    }
</style>
