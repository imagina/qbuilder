<template>
  <crud :crud-data="import('@imagina/qbuilder/_crud/contentBlocks.vue')" :custom-data="crudData" ref="crudComponent"
        :title="$route.meta.title" />
</template>
<script>
import {defineComponent} from 'vue'
import controller from '@imagina/qbuilder/_pages/admin/contentBlock/controller'

export default defineComponent({
  computed: {
    store() {
      return store
    }
  },
  props: {},
  components: {},
  setup() {
    return {...controller()}
  }
})
</script>
<style lang="stylus">
</style>
