<template>
  <div>
    <attributes-form v-model="showModal" :fields="contentFieldsBlock" :id-block="idBlock" @update="getDataTable"
                     :title="$tr('ibuilder.cms.blockEdit')"/>

    <crud :crud-data="import('@imagina/qbuilder/_crud/blocks.vue')" :custom-data="crudData" ref="crudComponent"
          :title="$route.meta.title"/>

    <inner-loading :visible="loading"/>
  </div>
</template>
<script>
import {defineComponent} from 'vue'
import controller from '@imagina/qbuilder/_pages/admin/contentBlock/controller'
import attributesForm from '@imagina/qbuilder/_components/dynamicFormAttributes/index.vue'

export default defineComponent({
  props: {},
  components: {attributesForm},
  setup() {
    return {...controller()}
  }
})
</script>
<style lang="stylus">
</style>
