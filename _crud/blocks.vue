<template></template>
<script>
export default {
  data() {
    return {
      crudId: this.$uid()
    }
  },
  computed: {
    crudData() {
      return {
        crudId: this.crudId,
        apiRoute: 'apiRoutes.qbuilder.blocks',
        permission: 'ibuilder.blocks',
        extraFormFields: 'ibuilder.crud-fields.blocks',
        create: {
          title: this.$tr('ibuilder.cms.newBlock'),
          to: {name: 'qbuilder.admin.blocks.create'}
        },
        read: {
          columns: [
            {name: 'id', label: this.$tr('isite.cms.form.id'), field: 'id', style: 'width: 50px'},
            {name: 'title', label: this.$tr('isite.cms.form.title'), field: 'title', align: 'left'},
            {name: 'systemName', label: this.$tr('isite.cms.form.systemName'), field: 'systemName', align: 'left'},
            {name: 'componentName', label: this.$tr('isite.cms.label.component'), field: 'componentName', align: 'left'},
            {
              name: 'created_at', label: this.$tr('isite.cms.form.createdAt'), field: 'createdAt', align: 'left',
              format: val => val ? this.$trd(val) : '-',
            },
            {name: 'actions', label: this.$tr('isite.cms.form.actions'), align: 'left'},
          ]
        },
        update: {
          title: this.$tr('isite.cms.updateBlock'),
          to: 'qbuilder.admin.blocks.update'
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
}
</script>
