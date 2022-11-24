<template>
  <div id="formBlockPage">
    <!--Page Actions-->
    <div class="box box-auto-height q-mb-md">
      <page-actions :title="settings.useLegacyStructure ? $tr($route.meta.title) : $route.meta.title"/>
    </div>
    <!--Content-->
    <div class="relative-position">
      <div class="row q-col-gutter-md">
        <div :class="colClassContent" v-if="showFormAttributes">
          <div class="box">
            <div class="row justify-between items-center">
              <!--Title-->
              <div class="box-title text-primary">
                {{ $tr("isite.cms.message.preview") }}
              </div>
              <!--Actions-->
              <div>
                <q-btn :icon="colClassContent == 'col' ? 'fa-thin fa-maximize' : 'fa-thin fa-minimize'"
                       @click="colClassContent = colClassContent == 'col' ? 'col-12' : 'col'"
                       unelevated outline color="grey-8" size="sm" padding="10px" rounded/>
              </div>
            </div>
            <!--Iframe-->
            <iframe
                :src="iframePreviewUrl"
                frameborder="0"
                width="100%"
                :height="`${windowHeigh - 320}px`"
            />
          </div>
        </div>
        <div :class="colClassContent">
          <q-scroll-area :style="`height: ${windowHeigh - 253}px; width: 100%;`">
            <q-form autocorrect="off" autocomplete="off" ref="formContent" @submit="submitData"
                    @validation-error="$alert.error($tr('isite.cms.message.formInvalid'))">
              <!--Form block-->
              <dynamic-form v-model="formBlock" :blocks="formFields.block" ref="mainForm" formType="grid"
                            no-actions no-reset-with-blocks-update/>
              <!--Form Entity-->
              <div v-if="selectedBlock && selectedBlock.block.content.length" class="box box-auto-height q-mb-md">
                <div class="row q-col-gutter-x-md">
                  <!--Title-->
                  <div class="box-title text-primary q-mb-md">
                    {{ formFields.entity.title }}
                  </div>
                  <div v-for="(field, key) in formFields.entity.fields" :key="key"
                       :class="field.colClass || field.columns || 'col-12 col-md-6'">
                    <dynamic-field v-model="formEntity[field.name || key]" :key="key" :field="field"
                                   v-if="field.vIf !== undefined ? field.vIf : true"/>
                  </div>
                </div>
              </div>
              <!--Form Attributes-->
              <div v-if="showFormAttributes" class="box box-auto-height no-child-box q-mb-md">
                <!--Form attributes-->
                <div v-if="elementSelected" class="q-mb-md">
                  <!--Title-->
                  <div class="box-title text-primary q-mb-md">
                    {{ $trp("isite.cms.label.attribute") }}
                  </div>
                  <!--Tabs elements-->
                  <q-tabs v-model="elementSelected" dense class="bg-grey-2 text-grey-8 q-mb-md" align="justify"
                          active-bg-color="info" indicator-color="grey-2" active-color="white">
                    <q-tab v-for="(element, indexFA) in selectedBlock.block.elements" :key="indexFA"
                           :name="element.systemName" :label="element.title"/>
                  </q-tabs>
                  <!-- Tab Panel elements-->
                  <div v-for="(element, indexFA) in selectedBlock.block.elements" :key="indexFA"
                       v-show="elementSelected == element.systemName" class="q-pa-none">
                    <dynamic-form v-model="formAttributes[element.name]" :blocks="element.attributes"
                                  formType="collapsible"/>
                  </div>
                </div>
              </div>
              <!--Actions-->
              <div class="box box-auto-height text-right">
                <q-btn unelevated rounded no-caps type="submit" :label="$tr('isite.cms.label.save')"
                       color="primary"/>
              </div>
            </q-form>
          </q-scroll-area>
        </div>
      </div>
      <!--Inner loading-->
      <inner-loading :visible="loading"/>
    </div>
  </div>
</template>
<script>
export default {
  beforeDestroy() {
    this.$root.$off('page.data.refresh')
  },
  props: {},
  components: {},
  watch: {
    'formBlock.componentName'() {
      //Reset Values
      this.formEntity = {}
      this.formAttributes = {}
      this.elementSelected = null
    },
    'formEntity.type'() {
      this.$set(this.formEntity, "id", null)
      this.$set(this.formEntity, "params", {"filter": {}, "take": 12})
    },
  },
  mounted() {
    this.$nextTick(function () {
      this.init()
    })
  },
  data() {
    return {
      loading: false,
      blockId: this.$route.params.id,
      configData: {},
      elementSelected: null,
      formBlock: {},
      formEntity: {},
      formAttributes: {},
      notToSnakeCase: ["component", "entity", "attributes"],
      colClassContent: "col",
      windowHeigh: window.innerHeight,
      templates: []
    }
  },
  computed: {
    // Validate the setting about the use the legacy structure of the CMS
    settings() {
      return {
        useLegacyStructure: parseInt(this.$store.getters['qsiteApp/getSettingValueByName']('isite::legacyStructureCMS') || 0),
        templatesBaseUrl: this.$store.getters['qsiteApp/getSettingValueByName']('ibuilder::blockTemplatesUrl')
      }
    },
    //Main fields
    formFields() {
      return {
        block: [{
          name: "main",
          fields: {
            helpText: {
              type: "banner",
              colClass: "col-12",
              props: {
                message: "Selecciona un 'Nombre de Sistema' unico que identifique el bloque y luego el componente que quieres perzonalizar..."
              }
            },
            title: {
              isTranslatable: true,
              type: "input",
              required: true,
              colClass: "col-12 col-md-4",
              props: {
                label: this.$tr("isite.cms.form.title") + "*"
              }
            },
            systemName: {
              type: "input",
              required: true,
              colClass: "col-12 col-md-4",
              props: {
                label: this.$tr("isite.cms.form.systemName") + "*"
              }
            },
            componentName: {
              type: "select",
              required: true,
              colClass: "col-12 col-md-4",
              props: {
                label: this.$tr("isite.cms.label.block") + "*",
                options: Object.values(this.blocks).filter(item => !item.internal).map(item => {
                  return {label: item.title, value: item.systemName}
                }),
                readonly: this.blockId ? true : false
              }
            },
            template: {
              type: "select",
              props: {
                vIf: false,
                label: this.$tr("isite.cms.label.template"),
                options: this.templatesByComponent.map(item => {
                  return {label: item.title, value: item.systemName}
                })
              }
            },
          }
        }],
        entity: {
          title: this.$trp("isite.cms.label.content"),
          fields: {
            helpText: {
              type: "banner",
              colClass: "col-12",
              props: {
                message: "Configura aquí la forma en que el componente cargará la información..."
              }
            },
            type: {
              type: "select",
              require: true,
              colClass: (this.formEntity.type && !this.loadOptionsContent) ? "col-12" : null,
              props: {
                label: `${this.$tr('isite.cms.label.entity')}*`,
                rules: [
                  val => !!val || this.$tr('isite.cms.message.fieldRequired')
                ],
                options: this.selectedBlock?.block.content || []
              }
            },
            id: {
              type: "select",
              require: true,
              vIf: this.loadOptionsContent ? true : false,
              props: {
                label: `${this.$tr('isite.cms.label.record')}*`,
                rules: [
                  val => !!val || this.$tr('isite.cms.message.fieldRequired')
                ]
              },
              loadOptions: this.loadOptionsContent
            },
            params: {
              type: "json",
              require: true,
              colClass: "col-12",
              vIf: (this.formEntity.type && !this.loadOptionsContent) ? true : false,
              props: {
                label: this.$trp('isite.cms.label.filter'),
                rules: [
                  val => !!val || this.$tr('isite.cms.message.fieldRequired')
                ]
              }
            },
          }
        }
      }
    },
    //Blocks
    blocks() {
      var response = {}
      //Validate if the module has blocks and map it
      Object.values(this.configData).filter(item => item).forEach(mBlocks => {
        if (!Array.isArray(mBlocks)) Object.keys(mBlocks).forEach(blockName => {
          //Map attributes
          var attributesAsblockstoForm = []
          attributesAsblockstoForm = Object.values(mBlocks[blockName].attributes).map((item, index) => {
            return {...item, name: index}
          })
          //Replace values of the block
          response[blockName] = {
            ...mBlocks[blockName],
            content: mBlocks[blockName].content || [],
            attributes: attributesAsblockstoForm
          }
        })
      })
      //Config the childBlocks
      Object.values(response).forEach(block => {
        //instance the block elements
        var blockElements = [
          {
            name: "componentAttributes",
            systemName: block.systemName,
            title: block.title,
            attributes: block.attributes
          }
        ]
        //Obtain the data of the child elements
        var childBlocks = block.childBlocks || {}
        if ((block.systemName != "x-isite::block") && !childBlocks.mainBlock) {
          childBlocks = {mainblock: "x-isite::block", ...childBlocks}
        }
        Object.keys(childBlocks).forEach(childName => {
          var childBlock = Object.values(response).find(item => item.systemName == childBlocks[childName])
          if (childBlock) blockElements.push({
            name: childName,
            systemName: childBlocks[childName],
            title: childBlock.title,
            attributes: childBlock.attributes
          })
        })
        //Set elements of the component
        block.elements = this.$clone(blockElements)
      })
      //response
      return response
    },
    //Selected block
    selectedBlock() {
      //Find the block
      const block = Object.values(this.blocks).find(block => block.systemName == this.formBlock.componentName)
      var response = null
      //order response
      if (block) {
        response = {
          block,
          elementsOptions: Object.values(block.elements).map(element => ({
            label: element.title,
            value: element.systemName
          }))
        }
        //set defaule element id
        setTimeout(() => this.elementSelected = Object.values(block.elements)[0].systemName, 100)
      }
      //response
      return response
    },
    //Return the apiRoute for the content
    loadOptionsContent() {
      let response = null
      if (this.selectedBlock) response = this.selectedBlock.block.content.find(item => {
        if (item.value == this.formEntity.type) return item
      })
      return response?.loadOptions || null
    },
    //Validate if show the form attributes and the preview
    showFormAttributes() {
      let response = true
      if (!this.selectedBlock) response = false
      //Validate the content
      const content = this.selectedBlock?.block.content || []
      if (content.length) {
        const selectedContent = content.find(item => item.value == this.formEntity.type)
        if (!selectedContent) response = false
        if (selectedContent && selectedContent.loadOptions && !this.formEntity.id) response = false
      }
      //Response
      return response
    },
    //Url to iframe preview
    iframePreviewUrl() {
      var baseUrl = this.$store.state.qsiteApp.baseUrl
      var component = encodeURIComponent(JSON.stringify({
        systemName: this.formBlock.componentName,
        nameSpace: this.selectedBlock.block.nameSpace
      }))
      var entity = encodeURIComponent(JSON.stringify(this.formEntity))
      var attributes = encodeURIComponent(JSON.stringify(this.formAttributes))

      return `${baseUrl}/blocks/preview?component=${component}&entity=${entity}&attributes=${attributes}`
    },
    //Return the templates by component
    templatesByComponent() {
      return this.templates.filter(item => {
        if (item.component.systemName == (this.selectedBlock?.block?.systemName || null)) return item
      })
    }
  },
  methods: {
    init() {
      this.getData()
      this.$root.$on('page.data.refresh', this.getData)//Listen refresh event
    },
    //Get data
    async getData() {
      this.loading = true
      await Promise.all([
        this.getModuleBlocks(),
        this.getTemplates()
      ])
      await this.getBlockData()
      this.loading = false
    },
    //Get module blocks
    getModuleBlocks() {
      return new Promise((resolve, reject) => {
        //Params
        let requestParams = {
          refresh: true,
          params: {
            filter: {allTranslations: true, configNameByModule: 'blocks'}
          }
        }
        //Request
        this.$crud.index('apiRoutes.qsite.configs', requestParams).then(response => {
          this.configData = response.data
          resolve(response.data)
        }).catch(error => {
          resolve(null)
        })
      })
    },
    //Get templates
    getTemplates() {
      return new Promise((resolve, reject) => {
        if (!this.settings.templatesBaseUrl) return resolve(true)
        //Params
        let requestParams = {
          refresh: true,
          params: {
            filter: {allTranslations: true, configNameByModule: 'blocks'}
          }
        }
        //Instance the full API for get the blocks(template)
        const templateBaseUrl = `${this.settings.templatesBaseUrl}/api${config('apiRoutes.qbuilder.blocks')}`
        //Request
        this.$axios.get(templateBaseUrl).then(response => {
          this.templates = this.$clone(response.data.data)
          resolve(response)
        }).catch(error => {
          reject(error.response)
        })
      })
    },
    //get block data
    getBlockData() {
      return new Promise((resolve, reject) => {
        if (!this.blockId) return resolve(null)
        //Params
        let requestParams = {
          refresh: true,
          params: {
            filter: {allTranslations: true}
          }
        }
        //Request
        this.$crud.show('apiRoutes.qbuilder.blocks', this.blockId, requestParams).then(response => {
          //Set the form block data
          this.formBlock = this.$clone({...response.data, componentName: response.data.component.systemName})
          setTimeout(() => {
            //Set the formEntity data
            this.formEntity = this.$clone(response.data.entity)
            setTimeout(() => {
              this.$set(this.formEntity, "params", response.data.entity.params)
              this.$set(this.formEntity, "id", response.data.entity.id)
            }, 500)
            //Set the formAttributes data
            this.formAttributes = this.$clone(response.data.attributes)
          }, 500)
          //Resolve
          resolve(response.data)
        }).catch(error => {
          resolve(null)
        })
      })
    },
    //Save data
    submitData() {
      //Instance the request data
      const requestData = {
        ...this.formBlock,
        component: {
          nameSpace: this.selectedBlock.block.nameSpace,
          systemName: this.selectedBlock.block.systemName
        },
        entity: {type: null, id: null, params: {}, ...this.formEntity},
        attributes: this.formAttributes
      }
      //Request
      this.blockId ? this.updateBlock(requestData) : this.createBlock(requestData)
    },
    //Create Block
    createBlock(data) {
      return new Promise(resolve => {
        this.loading = true
        //Request params
        const requestParams = {notToSnakeCase: this.notToSnakeCase}
        //request
        this.$crud.create("apiRoutes.qbuilder.blocks", data, requestParams).then(response => {
          this.$router.push({name: "qbuilder.admin.blocks.index"})
          this.loading = false
        }).catch(error => {
          this.loading = false
        })
      })
    },
    //Update Block
    updateBlock(data) {
      return new Promise(resolve => {
        this.loading = true
        //Request params
        const requestParams = {notToSnakeCase: this.notToSnakeCase}
        //request
        this.$crud.update("apiRoutes.qbuilder.blocks", this.blockId, data, requestParams).then(response => {
          this.$router.push({name: "qbuilder.admin.blocks.index"})
          this.loading = false
        }).catch(error => {
          console.warn(">>> Error", error)
          this.loading = false
        })
      })
    }
  }
}
</script>
<style lang="stylus">
#formBlockPage
  .no-child-box
    padding-bottom 0

    .box
      box-shadow none
      padding 0
</style>
