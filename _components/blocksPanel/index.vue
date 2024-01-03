<template>
  <div id="builderBlockPanel" class="bg-white relative-position">
    <div class="drawer-title q-py-lg q-px-md">
      <h2 class="text-center text-subtitle1 text-weight-bold">{{ $tr('ibuilder.cms.label.blocks') }}</h2>
    </div>
    <!--Block types-->
    <div class="row">
      <div class="col-4">
        <q-tabs v-model="blockTypeSelected" vertical class="tabs">
          <q-tab v-for="(type, keyItem) in blockTypes" :key="keyItem" :name="type.systemName" :label="type.title" no-caps/>
        </q-tabs>
      </div>
      <div class="col-8">

        <div v-if="!blockTypeSelected" class="q-pa-md text-center text-weight-bold">{{ $tr('ibuilder.cms.label.selectBlock') }}</div>

        <div v-if="blockTypeSelected">
          <div class="q-pa-md text-center text-weight-bold">{{ $tr('ibuilder.cms.label.localBlocks') }}</div>
          <q-item v-for="(block, blockKey) in blocksBySelectedType.local" :key="`localKey${blockKey}`" clickable
                  v-ripple active-class="list-selected" @click="selectBlock(block)">
            <q-item-section :class="`relative-position q-ma-sm selectable ${blockSelected && blockSelected.id == block.id && blockSelected.blockType === 'local' ? 'selectable--selected': ''}`">
              <img :src="block.mediaFiles.blockbgimage.path" :alt="block.internalTitle" />
              <span class="ellipsis-2-lines full-width title-item q-py-xs">{{ block.internalTitle}}</span>
            </q-item-section>
          </q-item>
          <q-separator />
          <div class="q-pa-md text-center text-weight-bold">{{ $tr('ibuilder.cms.label.libraryBlocks') }}</div>
          <q-item v-for="(block, blockKey) in blocksBySelectedType.library" :key="`libraryKey${blockKey}`" clickable
                  v-ripple active-class="list-selected" @click="selectBlock(block, 'library')">
            <q-item-section :class="`relative-position q-ma-sm selectable ${blockSelected && blockSelected.id == block.id && blockSelected.blockType === 'library' ? 'selectable--selected': ''}`">
              <img :src="block.mediaFiles.blockbgimage.path" :alt="block.internalTitle" />
              <span class="ellipsis-2-lines full-width title-item q-py-xs">{{ block.internalTitle}}</span>
            </q-item-section>
          </q-item>
        </div>
      </div>
    </div>
    <inner-loading :visible="loading"/>
  </div>
</template>
<script lang="ts">
import {defineComponent} from 'vue'
import controller from '@imagina/qbuilder/_components/blocksPanel/controller'

export default defineComponent({
  props: {},
  components: {},
  setup(props, {emit}) {
    return controller(props, emit)
  }
})
</script>
<style lang="stylus">
#builderBlockPanel
  width 800px

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

  .tabs {
    .q-tab--active {
      background $primary
      color white
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
