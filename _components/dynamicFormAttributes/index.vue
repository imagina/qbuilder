<template>
  <master-modal v-model="show" custom-position v-bind="modalProps" @hide="closeModal">
    <dynamic-form v-model="formBlock" formType="collapsible" :blocks="fields"
                  no-actions no-reset-with-blocks-update/>
  </master-modal>
</template>
<script lang="ts">
import {defineComponent} from 'vue'
import controller from './controller'

export default defineComponent({
  props: {
    modelValue: {default: false},
    title: {default: ''},
    idBlock: {default: null}
  },
  emits: ['update:modelValue', 'update'],
  components: {},
  setup(props, {emit}) {
    return controller(props, emit)
  }
})
</script>
<style lang="stylus">
</style>
