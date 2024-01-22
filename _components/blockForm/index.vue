<template>
  <dynamic-form v-model="formBlock" formType="grid" :blocks="formFields" @submit="submitData" />
</template>
<script lang="ts">
import {defineComponent} from 'vue'
import controller from '@imagina/qbuilder/_components/blockForm/controller'

export default defineComponent({
  props: {
    block: { type: Object },
    index: { type: Number, default: 0}
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
