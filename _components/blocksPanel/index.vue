<template>
  <div id="builderBlockPanel" class="bg-white relative-position">
    <div class="drawer-title q-py-lg q-px-md">
      <h2 class="text-center text-subtitle1 text-weight-bold">{{ $tr('ibuilder.cms.label.blocks') }}</h2>
    </div>
    <!--Block types-->
    <div class="row">
      <div class="col-4 border-tab">
        <div class="title-tabs bg-purple text-white">
          <span>Types of Blocks (PT)</span>
        </div>
        <q-tabs v-model="blockTypeSelected" vertical active-bg-color="primary"
                active-color="white" indicator-color="primary" class="scroll-content q-pr-sm">
          <q-tab v-for="(type, keyItem) in blockTypes" content-class="full-width items-start custom-position" :key="keyItem" :name="type.systemName" :label="type.title" no-caps />
        </q-tabs>
      </div>
      <div class="col-8">
        <q-tabs v-model="blockTypeTab" align="right" inline-label
                no-caps indicator-color="transparent" active-bg-color="purple" active-color="white"
                content-class="text-purple bg-grey-2">
          <q-tab name="global" :label="$tr('ibuilder.cms.label.libraryBlocks')" />
          <q-tab name="local" :label="$tr('ibuilder.cms.label.localBlocks')"/>
        </q-tabs>

        <q-tab-panels v-model="blockTypeTab" animated transition-prev="scale"
                      transition-next="scale" class="scroll-content">

          <!-- Global blocks -->
          <q-tab-panel name="global" class="q-pa-none">
            <q-item v-for="(block, blockKey) in blocksBySelectedType.library" :key="`libraryKey${blockKey}`" clickable
                    class="bg-trans-item" v-ripple @click="selectBlock(block)">
              <q-item-section class="relative-position q-ma-sm image-section selectable">
                <img :src="block.mediaFiles.blockbgimage.path" :alt="block.internalTitle" />
                <span class="ellipsis-2-lines full-width title-item q-py-xs">{{ block.internalTitle}}</span>
              </q-item-section>
            </q-item>
          </q-tab-panel>

          <!-- Local blocks -->
          <q-tab-panel name="local" class="q-pa-none overflow-hidden">
            <q-item v-for="(block, blockKey) in blocksBySelectedType.local" :key="`localKey${blockKey}`" clickable
                    class="bg-trans-item" v-ripple @click="selectBlock(block)">
              <q-item-section class="relative-position q-ma-sm image-section selectable">
                <img :src="block.mediaFiles.blockbgimage.path" :alt="block.internalTitle" />
                <span class="ellipsis-2-lines full-width title-item q-py-xs">{{ block.internalTitle}}</span>
              </q-item-section>
            </q-item>
          </q-tab-panel>

        </q-tab-panels>

      </div>
    </div>
    <inner-loading :visible="loading"/>
  </div>
</template>
<script lang="ts">
import {defineComponent} from 'vue'
import controller from '@imagina/qbuilder/_components/blocksPanel/controller'
import iframePost from "@imagina/qsite/_components/v3/iframePost/index.vue";
import handleGrid from "@imagina/qsite/_components/v3/handleGrid/index.vue";

export default defineComponent({
  props: {},
  components: {handleGrid, iframePost},
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
      align-items: flex-start
    }
  }

  .title-tabs {
    height 48px
    display grid
    place-items center
  }

  .scroll-content {
    //Calc title and tab panel heigh
    height calc(100vh - 126px)
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
    &:hover {
      transform none
    }

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
