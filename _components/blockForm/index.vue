<template>
  <div id="builderBlockForm" class="bg-white relative-position">
    <dynamic-form v-model="dataMainBlock" title="Crea un nuevo Bloque (PT)" no-actions
                  description="Aqui puedes crear un nuevo bolque (PT)" :blocks="formFields.main" />
<!--Hay un bug  con algunos bloques-->
    <dynamic-form v-model="dataContentBlock" formType="grid" no-actions :blocks="formFields.contentBlock"/>
  </div>
</template>
<script lang="ts">
import {defineComponent} from 'vue'
import controller from '@imagina/qbuilder/_components/blockForm/controller'
import { Block } from '@imagina/qbuilder/_components/blocksPanel/interface'

export default defineComponent({
  props: {
    block: { type: Object },
  },
  components: {},
  setup(props, {emit}) {
    return controller(props, emit)
  }
})
</script>
<style lang="stylus">
#builderBlockForm
  width 800px
  height 100vh
</style>
