<template></template>
<script>
export default {
  data() {
    return {
      crudId: this.$uid()
    };
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
          id: { value: '' },
          type: { value: 'general' },
          headerLayoutId: {
            type: 'select',
            isFakeField: true,
            props: {
              label: this.$tr('ibuilder.cms.form.header'),
              vIf: !['Modules\\Ibuilder\\Entities\\Layout'].includes(this.crudInfo.entityType)
            },
            loadOptions: {
              apiRoute: 'apiRoutes.qbuilder.layouts',
              select: { label: 'title', id: 'id' },
              requestParams: { filter: { type: 'header' } }
            }
          },
          footerLayoutId: {
            type: 'select',
            isFakeField: true,
            props: {
              label: this.$tr('ibuilder.cms.form.footer'),
              vIf: !['Modules\\Ibuilder\\Entities\\Layout'].includes(this.crudInfo.entityType)
            },
            loadOptions: {
              apiRoute: 'apiRoutes.qbuilder.layouts',
              select: { label: 'title', id: 'id' },
              requestParams: { filter: { type: 'footer' } }
            }
          },
          brandPrimary: {
            value: null,
            type: 'inputColor',
            isFakeField: true,
            colClass: 'col-12 col-md-6',
            props: {
              label: 'Brand Primary',
              vIf: this.crudInfo.type == 'home'
            }
          },
          brandSecondary: {
            value: null,
            type: 'inputColor',
            isFakeField: true,
            colClass: 'col-12 col-md-6',
            props: {
              label: 'Brand Secondary',
              vIf: this.crudInfo.type == 'home'
            }
          },
          brandTertiary: {
            value: null,
            type: 'inputColor',
            isFakeField: true,
            colClass: 'col-12 col-md-6',
            props: {
              label: 'Brand Tertiary',
              vIf: this.crudInfo.type == 'home'
            }
          },
          brandQuaternary: {
            value: null,
            type: 'inputColor',
            isFakeField: true,
            colClass: 'col-12 col-md-6',
            props: {
              label: 'Brand Quaternary',
              vIf: this.crudInfo.type == 'home'
            }
          },
          pageUsLayoutId: {
            type: 'select',
            isFakeField: true,
            props: {
              label: 'Page (Nosotros)',
              vIf: this.crudInfo.type == 'home'
            },
            loadOptions: {
              apiRoute: 'apiRoutes.qbuilder.layouts',
              select: { label: 'title', id: 'id' },
              requestParams: {
                filter: {
                  entityType: 'Modules\\Page\\Entities\\Page',
                  type: 'us'
                }
              }
            }
          },
          pageContactLayoutId: {
            type: 'select',
            isFakeField: true,
            props: {
              label: 'Page (Contacto)',
              vIf: this.crudInfo.type == 'home'
            },
            loadOptions: {
              apiRoute: 'apiRoutes.qbuilder.layouts',
              select: { label: 'title', id: 'id' },
              requestParams: {
                filter: {
                  entityType: 'Modules\\Page\\Entities\\Page',
                  type: 'contact'
                }
              }
            }
          },
          pageDefaultLayoutId: {
            type: 'select',
            isFakeField: true,
            props: {
              label: 'Page (Default)',
              vIf: this.crudInfo.type == 'home'
            },
            loadOptions: {
              apiRoute: 'apiRoutes.qbuilder.layouts',
              select: { label: 'title', id: 'id' },
              requestParams: {
                filter: {
                  entityType: 'Modules\\Page\\Entities\\Page',
                  type: 'general'
                }
              }
            }
          },
          BlogShowLayoutId: {
            type: 'select',
            isFakeField: true,
            props: {
              label: 'Blog (Show)',
              vIf: this.crudInfo.type == 'home'
            },
            loadOptions: {
              apiRoute: 'apiRoutes.qbuilder.layouts',
              select: { label: 'title', id: 'id' },
              requestParams: {
                filter: {
                  entityType: 'Modules\\Iblog\\Entities\\Post',
                  type: 'general'
                }
              }
            }
          },
          BlogCategoryLayoutId: {
            type: 'select',
            isFakeField: true,
            props: {
              label: 'Blog (Index)',
              vIf: this.crudInfo.type == 'home'
            },
            loadOptions: {
              apiRoute: 'apiRoutes.qbuilder.layouts',
              select: { label: 'title', id: 'id' },
              requestParams: {
                filter: {
                  entityType: 'Modules\\Iblog\\Entities\\Category',
                  type: 'general'
                }
              }
            }
          }
        },
        handleFormUpdates: (formData, changedFields, formType) => {
          return new Promise(resolve => {
            if (changedFields.length === 1 && changedFields.includes('entityType')) formData.type = null;
            resolve(formData);
          });
        }
      };
    },
    //Crud info
    crudInfo() {
      return this.$store.state.qcrudComponent.component[this.crudId] || {};
    },
    //Return the configBuilder by module only with values
    builderConfig() {
      let config = this.$store.getters['qsiteApp/getConfigApp']('builder.layout', true);
      let response = {};

      //Filter only items with values
      Object.keys(config).forEach(moduleName => {
        if (config[moduleName]) response[moduleName] = config[moduleName];
      });

      return response;
    },
    //Return the entityType options including the module name to each entity opt
    entityTypeOptions() {
      let response = [];
      Object.keys(this.builderConfig).forEach(moduleName => {
        // Get only the entity options including the module name to each label
        let moduleEntityTypeOptions = this.builderConfig[moduleName].map(item => ({
          ...item.entity,
          label: `${item.entity.label} (${moduleName})`
        }));
        // Set options to response
        response = [...response, ...moduleEntityTypeOptions];
      });
      return response;
    },
    // Return the type options by entityType selected
    typeOptions() {
      if (!this.crudInfo.entityType) return [];
      let moduleBuilderConfig = Object.values(this.builderConfig).flat().find(item => item.entity.value == this.crudInfo.entityType);
      return moduleBuilderConfig?.types || [];
    }
  }
};
</script>
