<template>
  <div id="builderLayoutLibraryPanel" class="bg-white relative-position">
    <div class="drawer-title q-py-md q-px-md">
      <h2 class="text-center text-subtitle1 text-weight-bold">{{ $tr('ibuilder.cms.layouts') }}</h2>
    </div>
    <!--Block types-->
    <div class="row" v-if="!loading">
      <div class="col-5">
        <div class="title-tabs"></div>
        <q-tabs v-model="layoutTypeSelected" vertical active-bg-color="primary" inline-label active-class="selected-item"
                active-color="white" indicator-color="primary" class="scroll-content border-tab"
                content-class="alternating-colors">
          <q-tab v-for="(type, keyItem) in layoutTypes" :key="keyItem" :name="type.entityType"
                 content-class="custom-position" no-caps>
            <div class="selection-item ellipsis row justify-between">
              {{ type.title }}
              <q-icon name="fa-light fa-arrow-right" class="q-mr-xs" size="16px" color="blue-grey"/>
            </div>
          </q-tab>
        </q-tabs>
      </div>
      <div class="col-7">
        <!--Buttons actions-->
        <div class="flex q-my-sm q-px-lg">
          <q-btn @click="selectedLayout(blockDefault)" outline rounded
                 class="full-width q-mx-sm text-capitalize" color="primary" no-caps padding="sm lg">
            <q-icon size="xs" left name="fa-solid fa-plus"/>
            <div class="text-center text-weight-bold">
              {{ $tr('ibuilder.cms.label.newLayout') }}
            </div>
          </q-btn>
        </div>

        <div :class="`scroll-content q-pa-none ${!layoutsBySelectedType.length ? 'overflow-hidden' : ''}`">
          <!--Empty Result-->
          <not-result v-if="!layoutsBySelectedType.length" class="q-mt-xl"/>
          <!--List-->
          <q-item v-else v-for="(layout, layoutKey) in layoutsBySelectedType" :key="`localKey${layoutKey}`"
                  clickable class="bg-trans-item" v-ripple @click="selectedLayout(layout)">
            <q-item-section class="relative-position q-ma-sm image-section selectable">
              <img :src="layout.mediaFiles.internalimage.url" :alt="layout.title"/>
              <span class="ellipsis-2-lines full-width title-item q-py-xs">{{ layout.title }}</span>
            </q-item-section>
          </q-item>
        </div>
      </div>
    </div>
    <!--Loading-->
    <inner-loading :visible="loading"/>
  </div>
</template>
<script lang="ts">
import {defineComponent} from 'vue'
import controller from '@imagina/qbuilder/_components/layoutLibraryPanel/controller'

export default defineComponent({
  props: {},
  components: {},
  setup(props, {emit}) {
    return controller(props, emit)
  }
})
</script>
<style lang="stylus">
#builderLayoutLibraryPanel
  width 800px
  height 100vh

  .border-tab {
    border-right 1px solid $blue-grey-1

    .custom-position {
      align-items: center
      justify-items left
      width 100%
    }

    .selection-item {
      width 100%
      text-align left
    }

    .selected-item {
      .q-icon {
        color white !important
      }
    }
  }

  .title-tabs {
    height 49px
  }

  .scroll-content {
    //Calc title and tab panel heigh
    height calc(100vh - 128px)
    overflow-y auto
  }

  .drawer-title {
    display fixed
    width 100%
    display flex
    text-align center
    align-items center
    justify-content center
    background-color $primary
    color white
  }

  .bg-trans-item {
    .q-focus-helper {
      visibility: hidden;
    }
  }

  .selectable {
    .title-item {
      opacity 1
      position absolute
      bottom 0
      background rgba(0, 0, 0, 0.75)
      display grid
      place-items center
      color white
    }
  }


</style>
