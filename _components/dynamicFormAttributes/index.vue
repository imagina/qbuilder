<template>
  <master-modal v-model="show" custom-position v-bind="modalProps" @hide="closeModal">
    <dynamic-form v-model="formBlock" formType="collapsible" :blocks="fields"
                  no-actions no-reset-with-blocks-update/>
  </master-modal>
</template>
<script lang="ts">
import {defineComponent} from 'vue'
import controller from '@imagina/qbuilder/_components/dynamicFormAttributes/controller'

export default defineComponent({
  props: {
    value: {default: false},
    title: {default: ''},
    idBlock: {default: null}
  },
  components: {},
  setup(props, {emit}) {
    return controller(props, emit)
  }
})
</script>
<style lang="stylus">
</style>
