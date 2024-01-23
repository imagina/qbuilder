<template>
  <master-modal v-model="showModal" title="Contenido del Bloque (PT)" custom-position modalWidthSize="650px" :actions="modalActions">
    <dynamic-form v-model="formBlock" formType="grid" :blocks="formFields" @submit="submitData"
                  no-actions ref="refForm"/>
  </master-modal>
</template>
<script lang="ts">
import {defineComponent} from 'vue'
import controller from '@imagina/qbuilder/_components/blockForm/controller'

export default defineComponent({
  props: {},
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
