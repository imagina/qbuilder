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
          title: this.$tr('ibuilder.cms.label.newLayout')
        },
        read: {},
        update: {
          title: this.$tr('ibuilder.cms.label.updateLayout')
        },
        delete: true,
        formLeft: {
          id: {value: ''},
          title: {
            value: '',
            type: 'input',
            isTranslatable: true,
            required: true,
            props: {
              label: `${this.$tr('isite.cms.form.name')}`,
            },
          },
          systemName: {
            value: this.$uid(),
            type: 'input',
            required: true,
            props: {
              label: this.$tr('isite.cms.form.systemName'),
              vIf: false
            }
          },
          entityType: {
            value: '',
            type: 'select',
            help: {
              description: this.$tr('ibuilder.cms.form.layoutEntityType')
            },
            required: true,
            props: {
              label: this.$tr('iqreable.cms.form.entityType'),
              options: this.entityTypeOptions
            }
          },
          type: {
            value: '',
            type: 'select',
            help: {
              description: this.$tr('ibuilder.cms.form.layoutType')
            },
            props: {
              label: this.$tr('isite.cms.form.type'),
              vIf: this.crudInfo.entityType && this.typeOptions.length,
              clearable: true,
              options: this.typeOptions
            }
          },
          default: {
            value: '0',
            type: 'select',
            required: true,
            help: {
              description: this.$tr('ibuilder.cms.form.layoutDefault')
            },
            props: {
              label: this.$tr('isite.cms.form.default'),
              options: [
                {label: this.$tr('isite.cms.label.yes'), value: '1'},
                {label: this.$tr('isite.cms.label.no'), value: '0'},
              ]
            },
          },
        },
        handleFormUpdates: (formData, changedFields, formType) => {
          return new Promise(resolve => {
            if (changedFields.length === 1 && changedFields.includes('entityType')) formData.type = null
            resolve(formData)
          })
        }
      }
    },
    //Crud info
    crudInfo() {
      return this.$store.state.qcrudComponent.component[this.crudId] || {}
    },
    //Return the configBuilder by module only with values
    builderConfig() {
      let config = this.$store.getters['qsiteApp/getConfigApp']('builder.layout', true)
      let response = {}

      //Filter only items with values
      Object.keys(config).forEach(moduleName => {
        if (config[moduleName]) response[moduleName] = config[moduleName]
      })

      return response
    },
    //Return the entityType options including the module name to each entity opt
    entityTypeOptions() {
      let response = []
      Object.keys(this.builderConfig).forEach(moduleName => {
        // Get only the entity options including the module name to each label
        let moduleEntityTypeOptions = this.builderConfig[moduleName].map(item => ({
          ...item.entity,
          label: `${item.entity.label} (${moduleName})`
        }))
        // Set options to response
        response = [...response, ...moduleEntityTypeOptions]
      })
      return response
    },
    // Return the type options by entityType selected
    typeOptions() {
      if (!this.crudInfo.entityType) return []
      let moduleBuilderConfig = Object.values(this.builderConfig).flat().find(item => item.entity.value == this.crudInfo.entityType)
      return moduleBuilderConfig.types
    }
  }
}
</script>
