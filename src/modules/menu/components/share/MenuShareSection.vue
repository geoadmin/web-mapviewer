<template>
    <MenuSection
        :title="$t('share')"
        data-cy="menu-share-section"
        secondary
        @click.once="generateShortLinkIfMNeeded"
    >
        <div class="share-icons d-flex">
            <ButtonWithIcon
                :button-font-awesome-icon="['fa', 'envelope']"
                large
                @click="shareEmail"
            />
            <ButtonWithIcon
                :button-font-awesome-icon="['fa', 'qrcode']"
                large
                @click="openQRCodeLink"
            />
            <a
                class="share-icon"
                target="_blank"
                data-original-title="Share this map with your friends"
                href="http://www.facebook.com/sharer.php?u=https%3A%2F%2Fmap.geo.admin.ch%2F%3Flang%3Den%26topic%3Dech%26bgLayer%3Dch.swisstopo.pixelkarte-farbe%26layers%3Dch.swisstopo.zeitreihen%2Cch.bfs.gebaeude_wohnungs_register%2Cch.bav.haltestellen-oev%2Cch.swisstopo.swisstlm3d-wanderwege%2Cch.astra.wanderland-sperrungen_umleitungen%26layers_opacity%3D1%2C1%2C1%2C0.8%2C0.8%26layers_visibility%3Dfalse%2Cfalse%2Cfalse%2Cfalse%2Cfalse%26layers_timestamp%3D18641231%2C%2C%2C%2C&amp;t=Maps%20of%20Switzerland%20-%20Swiss%20Confederation%20%20-%20map.geo.admin.ch"
                ><i class="fa fa-facebook"></i></a
            ><a
                class="share-icon"
                target="_blank"
                data-original-title="Tweet this map"
                href="https://twitter.com/intent/tweet?url=https%3A%2F%2Fmap.geo.admin.ch%2F%3Flang%3Den%26topic%3Dech%26bgLayer%3Dch.swisstopo.pixelkarte-farbe%26layers%3Dch.swisstopo.zeitreihen%2Cch.bfs.gebaeude_wohnungs_register%2Cch.bav.haltestellen-oev%2Cch.swisstopo.swisstlm3d-wanderwege%2Cch.astra.wanderland-sperrungen_umleitungen%26layers_opacity%3D1%2C1%2C1%2C0.8%2C0.8%26layers_visibility%3Dfalse%2Cfalse%2Cfalse%2Cfalse%2Cfalse%26layers_timestamp%3D18641231%2C%2C%2C%2C&amp;text=Maps%20of%20Switzerland%20-%20Swiss%20Confederation%20%20-%20map.geo.admin.ch"
                ><i class="fa fa-twitter"></i></a
            ><!-- ngIf: showWhatsapp -->
        </div>
        <div class="ga-share-permalink">
            <label><span translate="" class="ng-scope">Share link</span>: </label>
            <div class="input-group input-group-sm ng-isolate-scope" ga-share-copy-input-group="">
                <input
                    id="permalinkInput"
                    type="text"
                    ng-model="permalinkValue"
                    class="form-control ng-pristine ng-valid ng-isolate-scope ng-not-empty ng-touched"
                    ga-share-copy-input=""
                    readonly="readonly"
                    data-original-title=""
                    title=""
                /><span class="input-group-btn"
                    ><button class="btn btn-default ng-isolate-scope" ga-share-copy-bt="">
                        <span ng-show="isCopied" translate="" class="ng-scope ng-hide"
                            >Link copied!</span
                        ><span ng-show="!isCopied" translate="" class="ng-scope"
                            >Copy the link</span
                        >
                    </button></span
                >
            </div>
        </div>
        <div class="ga-show-more hidden-xs">
            <div ng-click="showMoreClick()">
                <i
                    ng-class="{'fa fa-minus': showMore, 'fa fa-plus': !showMore}"
                    class="fa fa-plus"
                ></i
                ><span ng-show="showMore" translate="" class="ng-scope ng-hide">Embed:</span
                ><span ng-hide="showMore" translate="" class="ng-scope">Embed ...</span>
            </div>
            <div class="ga-share-embed ng-hide" ng-show="showMore">
                <div
                    class="input-group input-group-sm ng-isolate-scope"
                    ga-share-copy-input-group=""
                >
                    <input
                        type="text"
                        class="form-control ga-embed-input ng-isolate-scope"
                        value="<iframe src='https://map.geo.admin.ch/embed.html?lang=en&amp;topic=ech&amp;bgLayer=ch.swisstopo.pixelkarte-farbe&amp;layers=ch.swisstopo.zeitreihen,ch.bfs.gebaeude_wohnungs_register,ch.bav.haltestellen-oev,ch.swisstopo.swisstlm3d-wanderwege,ch.astra.wanderland-sperrungen_umleitungen&amp;layers_opacity=1,1,1,0.8,0.8&amp;layers_visibility=false,false,false,false,false&amp;layers_timestamp=18641231,,,,' width='400' height='300' frameborder='0' style='border:0' allow='geolocation'></iframe>"
                        ga-share-copy-input=""
                        readonly="readonly"
                        data-original-title=""
                        title=""
                    /><span class="input-group-btn"
                        ><button
                            class="btn btn-default btn-xs ng-scope"
                            ng-click="openEmbedModal()"
                            translate=""
                        >
                            Preview
                        </button></span
                    >
                </div>
                <div translate="" class="ng-scope">
                    You can embed the map into your website or blog.
                    <a
                        href="https://www.geo.admin.ch/en/about-swiss-geoportal/impressum.html#iframe"
                        target="_blank"
                        >Terms of use</a
                    >
                </div>
            </div>
        </div>
    </MenuSection>
</template>

<script>
import MenuSection from '@/modules/menu/components/menu/MenuSection.vue'
import ButtonWithIcon from '@/utils/ButtonWithIcon.vue'
import { mapActions, mapState } from 'vuex'
import { API_SERVICES_BASE_URL } from '@/config'

export default {
    components: { ButtonWithIcon, MenuSection },
    computed: {
        ...mapState({
            shortLink: (state) => state.position.shortLink,
        }),
    },
    methods: {
        ...mapActions(['generateShortLink']),
        generateShortLinkIfMNeeded() {
            if (!this.shortLink) {
                this.generateShortLink()
            }
        },
        openUrlInNewTab(url) {
            window.open(url, '_blank')
        },
        shareEmail() {
            window.location.href = `mailto:?body=${this.shortLink}`
        },
        openQRCodeLink() {
            this.openUrlInNewTab(`${API_SERVICES_BASE_URL}qrcode/generate?url=${this.shortLink}`)
        },
    },
}
</script>

<style lang="scss"></style>
