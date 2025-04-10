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
              label: this.$tr('ibuilder.cms.form.header')
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
              label: this.$tr('ibuilder.cms.form.footer')
            },
            loadOptions: {
              apiRoute: 'apiRoutes.qbuilder.layouts',
              select: { label: 'title', id: 'id' },
              requestParams: { filter: { type: 'footer' } }
            }
          },
          pageUsLayoutId: {
            type: 'select',
            isFakeField: true,
            props: {
              label: 'Page (Nosotros)'
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
              label: 'Page (Contacto)'
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
              label: 'Page (Default)'
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
              label: 'Blog (Show)'
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
              label: 'Blog (Index)'
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
          },
          brandPrimary: {
            value: null,
            type: 'inputColor',
            isFakeField: true,
            colClass: 'col-12 col-md-6',
            props: {
              label: 'Brand Primary'
            }
          },
          brandSecondary: {
            value: null,
            type: 'inputColor',
            isFakeField: true,
            colClass: 'col-12 col-md-6',
            props: {
              label: 'Brand Secondary'
            }
          },
          brandTertiary: {
            value: null,
            type: 'inputColor',
            isFakeField: true,
            colClass: 'col-12 col-md-6',
            props: {
              label: 'Brand Tertiary'
            }
          },
          brandQuaternary: {
            value: null,
            type: 'inputColor',
            isFakeField: true,
            colClass: 'col-12 col-md-6',
            props: {
              label: 'Brand Quaternary'
            }
          },
          customCss: {
            value: null,
            type: 'input',
            isFakeField: true,
            colClass: 'col-12 col-md-12',
            props: {
              label: 'Custom Css',
              type: 'textarea',
              rows: 12,
            },
          },
          customJs: {
            value: null,
            type: 'input',
            isFakeField: true,
            colClass: 'col-12 col-md-12',
            props: {
              label: 'Custom Js',
              type: 'textarea',
              rows: 12,
            },
          },
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
