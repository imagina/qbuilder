<template>
  <div id="builderBlockPanel" class="bg-white relative-position">
    <div class="drawer-title q-py-lg q-px-md">
      <h2 class="text-center text-subtitle1 text-weight-bold">Blocks (PT)</h2>
    </div>
    <!--Block types-->
    <div class="row">
      <div class="col-4">
        <q-tabs v-model="blockTypeSelected" vertical class="text-teal">
          <q-tab v-for="(type, keyItem) in blockTypes" :key="keyItem" :name="type" :label="type" no-caps/>
        </q-tabs>
      </div>
      <div class="col-8">

        <div v-if="!blockTypeSelected" class="q-pa-md text-center text-weight-bold">Selecciona un bloque</div>

        <div v-if="blockTypeSelected">
          <div class="q-pa-md text-center text-weight-bold">Local Blocks (PT)</div>
          <q-item v-for="(block, blockKey) in blocksBySelectedType.local" :key="`localKey${blockKey}`" clickable
                  v-ripple active-class="list-selected" @click="blockSelected(block)">
            <q-item-section>
              <span class="ellipsis-2-lines full-width">{{ block.internalTitle}} ({{block.systemName}})</span>
            </q-item-section>
            <q-item-section avatar>
              <q-icon size="xs" name="fa-light fa-arrow-right"/>
            </q-item-section>
          </q-item>
          <q-separator />
          <div class="q-pa-md text-center text-weight-bold">Library Blocks (PT)</div>
          <q-item v-for="(block, blockKey) in blocksBySelectedType.library" :key="`libraryKey${blockKey}`" clickable
                  v-ripple active-class="list-selected" @click="blockSelected(block)">
            <q-item-section>
              <span class="ellipsis-2-lines full-width">{{ block.internalTitle}} ({{block.systemName}})</span>
            </q-item-section>
            <q-item-section avatar>
              <q-icon size="xs" name="fa-light fa-arrow-right"/>
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
</style>
