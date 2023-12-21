<template>
  <div id="builderBlockPanel" class="bg-white relative-position">
    Blocks (PT)
    <!--Block types-->
    <div class="row">
      <div class="col-4">
        <q-tabs v-model="blockTypeSelected" vertical class="text-teal">
          <q-tab v-for="(type, keyItem) in blockTypes" :key="keyItem" :name="type" :label="type" no-caps/>
        </q-tabs>
      </div>
      <div class="col-8">
        Local Blocks (PT)
        <div v-for="(block, blockKey) in blocksBySelectedType.local" :key="`localKey${blockKey}`">
          - {{ block.internalTitle}} ({{block.systemName}})
        </div>
        <q-separator />
        Library Blocks (PT)
        <div v-for="(block, blockKey) in blocksBySelectedType.library" :key="`libraryKey${blockKey}`">
          - {{ block.internalTitle}} ({{block.systemName}})
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
  width 500px
</style>
