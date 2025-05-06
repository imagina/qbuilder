<template>
  <attributes-form v-model="showModal" :id-block="idBlock" :title="$tr('ibuilder.cms.blockEdit')"/>
</template>
<script>
import attributesForm from '../_components/dynamicFormAttributes/index.vue'

export default {
  data() {
    return {
      crudId: this.$uid(),
      showModal: false,
      idBlock: null,
    }
  },
  components: {attributesForm},
  computed: {
    crudData() {
      return {
        crudId: this.crudId,
        apiRoute: 'apiRoutes.qbuilder.blocks',
        permission: 'ibuilder.blocks',
        create: false,
        read: {
          columns: [
            {name: 'id', label: this.$tr('isite.cms.form.id'), field: 'id', style: 'width: 50px'},
            {name: 'title', label: this.$tr('isite.cms.form.title'), field: 'internalTitle', align: 'left'},
            {
              name: 'componentName', label: this.$tr('isite.cms.label.component'), field: 'component', align: 'left',
              format: val => val.systemName || "-"
            },
            {name: 'systemName', label: this.$tr('isite.cms.form.systemName'), field: 'systemName', align: 'left'},
            {name: 'status', label: this.$tr('isite.cms.form.status'), field: 'status', align: 'left'},
            {
              name: 'created_at', label: this.$tr('isite.cms.form.createdAt'), field: 'createdAt', align: 'left',
              format: val => val ? this.$trd(val) : '-',
            },
            {name: 'actions', label: this.$tr('isite.cms.form.actions'), align: 'left'},
          ],
          requestParams: {
            filter: {withContentEditable: 1}
          }
        },
        update: {
          method: (item) => this.openModal(item.id)
        },
        delete: true,
        formLeft: {}
      }
    },
    //Crud info
    crudInfo() {
      return this.$store.state.qcrudComponent.component[this.crudId] || {}
    }
  },
  methods: {
    openModal(id) {
      if (!id) return

      this.idBlock = id;
      this.showModal = true;
    }
  }
}
</script>
