<template>
  <div id="builderBlockForm" class="bg-white relative-position">

    <div class="q-pt-md q-px-md">
      <!--Title-->
      <div class="box-title text-center q-mb-md">Crea un nuevo Bloque (PT)</div>
      <!--Description-->
      <div class="text-body2 q-mb-md text-grey-8">Aqui puedes crear un nuevo bolque (PT)</div>

      <q-separator />
    </div>

    <dynamic-form v-model="formBlock" formType="grid" :blocks="formFields"/>
  </div>
</template>
<script lang="ts">
import {defineComponent} from 'vue'
import controller from '@imagina/qbuilder/_components/blockForm/controller'

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
