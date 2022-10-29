<template>
  <div id="formBlockPage">
    <!--Page Actions-->
    <div class="box box-auto-height q-mb-md">
      <page-actions :title="useLegacyStructure ? $tr($route.meta.title) : $route.meta.title"/>
    </div>
    <!--Content-->
    <div class="relative-position">
      <div class="row q-col-gutter-md">
        <div class="col" v-if="showFormAttributes">
          <iframe
              :src="iframePreviewUrl"
              frameborder="0"
              class="box"
              width="100%"
              height="600px"
          />
        </div>
        <div class="col">
          <q-form autocorrect="off" autocomplete="off" ref="formContent" @submit="submitData"
                  @validation-error="$alert.error($tr('isite.cms.message.formInvalid'))">
            <!--Form block-->
            <dynamic-form v-model="formBlock" :blocks="formFields.block" ref="mainForm" formType="grid" no-actions/>
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
                <q-tab-panels v-model="elementSelected" animated>
                  <q-tab-panel v-for="(element, indexFA) in selectedBlock.block.elements" :key="indexFA"
                               :name="element.systemName" class="q-pa-none">
                    <dynamic-form v-model="formAttributes[element.name]" :blocks="element.attributes"
                                  formType="collapsible"/>
                  </q-tab-panel>
                </q-tab-panels>
              </div>
            </div>
            <!--Actions-->
            <div class="box box-auto-height text-right">
              <q-btn unelevated rounded no-caps type="submit" :label="$tr('isite.cms.label.save')"
                     color="primary"/>
            </div>
          </q-form>
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
      formAttributes: {}
    }
  },
  computed: {
    // Validate the setting about the use the legacy structure of the CMS
    useLegacyStructure() {
      return parseInt(this.$store.getters['qsiteApp/getSettingValueByName']('isite::legacyStructureCMS') || 0)
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
                message: "Here you can choose the component for this block and customise it..."
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
                label: this.$tr("isite.cms.label.block"),
                options: Object.values(this.blocks).map(item => {
                  return {label: item.title, value: item.systemName}
                }),
                readonly: this.blockId ? true : false
              }
            }
          }
        }],
        entity: {
          title: this.$trp("isite.cms.label.content"),
          fields: {
            helpText: {
              type: "banner",
              colClass: "col-12",
              props: {
                message: "Choose the record for the content in the block..."
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
            name: "mainAttributes",
            systemName: block.systemName,
            title: block.title,
            attributes: block.attributes
          }
        ]
        //Obtain the data of the child elements
        if (block.childBlocks) {
          Object.keys(block.childBlocks).forEach(childName => {
            var childBlock = Object.values(response).find(item => item.systemName == block.childBlocks[childName])
            if (childBlock) blockElements.push({
              name: childName,
              systemName: block.childBlocks[childName],
              title: childBlock.title,
              attributes: childBlock.attributes
            })
          })
        }
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
      var itemComponentNamespace = encodeURIComponent(this.selectedBlock.block.nameSpace)
      var itemComponent = encodeURIComponent(this.formBlock.componentName)
      var itemComponentAttributes = encodeURIComponent(JSON.stringify(this.formAttributes))
      var itemComponentEntity = encodeURIComponent(JSON.stringify(this.formEntity))

      return `${baseUrl}/blocks/preview?itemComponentNamespace=${itemComponentNamespace}&itemComponent=${itemComponent}&itemComponentAttributes=${itemComponentAttributes}&itemComponentEntity=${itemComponentEntity}`
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
      await this.getModuleBlocks()
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
          this.formBlock = this.$clone(response.data)
          setTimeout(() => {
            //Set formEntity
            this.formEntity = this.$clone(response.data.entity)
            setTimeout(() => this.$set(this.formEntity, "params", response.data.entity.params), 500)
            //Set formAttributes
            var attributes = {}
            Object.keys(response.data.attributes).forEach(elementName => {
              var elmntName = this.$helper.snakeToCamelCase(elementName)
              attributes[elmntName] = {}
              Object.keys(response.data.attributes[elementName]).forEach(attributeName => {
                attributes[elmntName][this.$helper.snakeToCamelCase(attributeName)] = response.data.attributes[elementName][attributeName]
              })
            })
            this.formAttributes = attributes
          }, 500)
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
        //request
        this.$crud.create("apiRoutes.qbuilder.blocks", data).then(response => {
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
        //request
        this.$crud.update("apiRoutes.qbuilder.blocks", this.blockId, data).then(response => {
          this.$router.push({name: "qbuilder.admin.blocks.index"})
          this.loading = false
        }).catch(error => {
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
