<script setup>
import gsap from 'gsap'
import { nextTick, onMounted, ref } from 'vue'
import { useStore } from 'vuex'

import ImportFileLocalTab from '@/modules/menu/components/advancedTools/ImportFile/ImportFileLocalTab.vue'
import ImportFileOnlineTab from '@/modules/menu/components/advancedTools/ImportFile/ImportFileOnlineTab.vue'
import SimpleWindow from '@/utils/components/SimpleWindow.vue'

const debounceAnimate = ref(false)
const selectedTab = ref('online')

const store = useStore()

onMounted(() => {
    // using a boolean and a v-if to trigger the Vue Transition
    // starting with our element hidden (not added to the DOM)
    debounceAnimate.value = false
    // after a tick of Vue's lifecycle, add the element to the DOM
    // this will trigger the animation from the Transition
    nextTick(() => {
        debounceAnimate.value = true
    })
})

function onBeforeEnter(el) {
    // setting the import popup minimized, outside the screen (on the top-left position, behind the menu)
    gsap.set(el, {
        x: `-100vw`,
        y: `-100vh`,
        scaleX: 0,
        scaleY: 0,
    })
}

function onEnter(el, done) {
    // moving the import popup back where it naturally sits
    gsap.to(el, {
        // no duration set, default is 0.5sec
        x: 0,
        y: 0,
        scaleX: 1,
        scaleY: 1,
        // important : call the done() callback to tell the Transition we are done
        onComplete: done,
    })
}
</script>

<template>
    <teleport to="#map-footer-middle-1">
        <Transition :css="false" @before-enter="onBeforeEnter" @enter="onEnter">
            <SimpleWindow
                v-if="debounceAnimate"
                title="import_file"
                class="rounded-0"
                @close="store.dispatch('toggleImportFile')"
            >
                <div data-cy="import-file-content" class="container">
                    <ul class="nav nav-tabs" role="tablist">
                        <li class="nav-item" role="presentation">
                            <button
                                class="nav-link py-1"
                                :class="{
                                    active: selectedTab === 'online',
                                }"
                                type="button"
                                role="tab"
                                aria-controls="nav-online"
                                :aria-selected="selectedTab === 'online'"
                                data-cy="import-file-online-btn"
                                @click="selectedTab = 'online'"
                            >
                                Online
                            </button>
                        </li>
                        <li class="nav-item" role="presentation">
                            <button
                                class="nav-link py-1"
                                :class="{
                                    active: selectedTab === 'local',
                                }"
                                type="button"
                                role="tab"
                                aria-controls="nav-local"
                                :aria-selected="selectedTab === 'local'"
                                data-cy="import-file-local-btn"
                                @click="selectedTab = 'local'"
                            >
                                Local
                            </button>
                        </li>
                    </ul>
                    <div class="tab-content mt-2">
                        <!-- Online Tab -->
                        <ImportFileOnlineTab :active="selectedTab === 'online'" />
                        <!-- Local tab -->
                        <ImportFileLocalTab :active="selectedTab === 'local'" />
                    </div>
                </div>
            </SimpleWindow>
        </Transition>
    </teleport>
</template>

<style lang="scss" scoped>
@import 'src/scss/webmapviewer-bootstrap-theme';
</style>
