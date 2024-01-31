<template>
  <div id="builderBlockPanel" class="bg-white relative-position">
    <div class="drawer-title q-py-md q-px-md">
      <h2 class="text-center text-subtitle1 text-weight-bold">{{ $tr('ibuilder.cms.label.blocks') }}</h2>
    </div>
    <!--Block types-->
    <div class="row" v-if="!loading">
      <div class="col-5">
        <div class="title-tabs"></div>
        <q-tabs v-model="blockTypeSelected" vertical active-bg-color="primary" inline-label active-class="selected-item"
                active-color="white" indicator-color="primary" class="scroll-content border-tab"
                content-class="alternating-colors">
          <q-tab v-for="(type, keyItem) in blockTypes" :key="keyItem" :name="type.systemName"
                 content-class="custom-position" no-caps>
            <div class="selection-item ellipsis row justify-between">
              {{ type.title }}
              <q-icon name="fa-light fa-arrow-right" class="q-mr-xs" size="16px" color="blue-grey"/>
            </div>
          </q-tab>
        </q-tabs>
      </div>
      <div class="col-7">
        <q-tabs v-model="blockTypeTab" align="right" inline-label
                no-caps indicator-color="transparent" :active-bg-color="tabColor" active-color="white"
                :content-class="`text-${tabColor} bg-grey-2`">
          <q-tab name="global" :label="$tr('ibuilder.cms.label.libraryBlocks')"/>
          <q-tab name="local" :label="$tr('ibuilder.cms.label.localBlocks')"/>
        </q-tabs>
        <q-separator :color="tabColor" size="2px"/>

        <q-tab-panels v-model="blockTypeTab" animated transition-prev="scale"
                      transition-next="scale" class="scroll-content">

          <!-- Global blocks -->
          <q-tab-panel name="global" class="q-pa-none">
            <!--Empty Result-->
            <not-result v-if="!blocksBySelectedType.library.length" class="q-mt-xl"/>
            <!--List-->
            <q-item v-else v-for="(block, blockKey) in blocksBySelectedType.library" :key="`libraryKey${blockKey}`"
                    clickable class="bg-trans-item" v-ripple @click="selectBlock(block)">
              <q-item-section class="relative-position q-ma-sm image-section selectable">
                <img :src="block.mediaFiles.blockbgimage.path" :alt="block.internalTitle"/>
                <span class="ellipsis-2-lines full-width title-item q-py-xs">{{ block.internalTitle }}</span>
              </q-item-section>
            </q-item>
          </q-tab-panel>

          <!-- Local blocks -->
          <q-tab-panel name="local" :class="`q-pa-none ${!blocksBySelectedType.local.length ? 'overflow-hidden' : ''}`">
            <!--Buttons actions-->
            <div class="flex q-mt-sm q-px-lg">
              <q-btn @click="selectBlock(blockDefault)" outline rounded
                     class="full-width q-mx-sm text-capitalize" color="primary" no-caps padding="sm lg">
                <q-icon size="xs" left name="fa-solid fa-plus"/>
                <div class="text-center text-weight-bold">
                  {{ $tr('ibuilder.cms.newBlock') }}
                </div>
              </q-btn>
            </div>
            <!--Empty Result-->
            <not-result v-if="!blocksBySelectedType.local.length" class="q-mt-xl"/>
            <!--List-->
            <q-item v-else v-for="(block, blockKey) in blocksBySelectedType.local" :key="`localKey${blockKey}`"
                    clickable class="bg-trans-item" v-ripple @click="selectBlock(block)">
              <q-item-section class="relative-position q-ma-sm image-section selectable">
                <img :src="block.mediaFiles.blockbgimage.path" :alt="block.internalTitle"/>
                <span class="ellipsis-2-lines full-width title-item q-py-xs">{{ block.internalTitle }}</span>
              </q-item-section>
            </q-item>
          </q-tab-panel>

        </q-tab-panels>

      </div>
    </div>
    <!--Block Form-->
    <block-form ref="refBlockForm" @created="emitCreated" />
    <!--Loading-->
    <inner-loading :visible="loading"/>
  </div>
</template>
<script lang="ts">
import {defineComponent} from 'vue'
import controller from '@imagina/qbuilder/_components/blocksPanel/controller'
import blockForm from '@imagina/qbuilder/_components/blockContentForm/index.vue'

export default defineComponent({
  props: {
    index: {type: Number, default: 0},
    layoutId: {type: Number, default: 0}
  },
  components: {blockForm},
  setup(props, {emit}) {
    return controller(props, emit)
  }
})
</script>
<style lang="stylus">
#builderBlockPanel
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
    &:hover .title-item,
    &.selectable--selected .title-item {
      opacity 1
    }

    .title-item {
      opacity 0
      position absolute
      bottom 0
      background rgba(0, 0, 0, 0.75)
      display grid
      place-items center
      color white
    }
  }


</style>
