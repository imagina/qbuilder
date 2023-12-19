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
        apiRoute: 'apiRoutes.qbuilder.layouts',
        create: {
          title: this.$tr('ibuilder.cms.newLayout')
        },
        read: {},
        update: {
          title: this.$tr('ibuilder.cms.updateLayout')
        },
        delete: true,
        formLeft: {
          id: {value: ''},
          title: {
            value: '',
            type: 'input',
            isTranslatable: true,
            props: {
              label: `${this.$tr('isite.cms.form.name')}`,
            },
          },
          systemName: {
            value: '',
            type: 'input',
            props: {
              label: this.$tr('isite.cms.form.systemName'),
              rules: [
                val => !!val || this.$tr('isite.cms.message.fieldRequired')
              ]
            }
          },
          entityType: {
            value: '',
            type: 'select',
            props: {
              label: this.$tr('iqreable.cms.form.entityType'),
              options: [
                {label: "Page", value: 'Modules\\Page\\Entities\\Page'},
              ]
            }
          },
          type: {
            value: '',
            type: 'select',
            props: {
              label: this.$tr('isite.cms.form.type'),
              options: [
                {label: 'Nosotros', value: 'us'}
              ]
            }
          },
          default: {
            value: '0',
            type: 'select',
            props: {
              label: this.$tr('isite.cms.form.default'),
              options: [
                {label: this.$tr('isite.cms.label.yes'), value: '1'},
                {label: this.$tr('isite.cms.label.no'), value: '0'},
              ]
            },
          },
        },
        formRight: {},
      }
    },
    //Crud info
    crudInfo() {
      return this.$store.state.qcrudComponent.component[this.crudId] || {}
    }
  }
}
</script>
