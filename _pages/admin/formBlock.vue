<template>
  <div id="formBlockPage">
    <!--Page Actions-->
    <div class="box box-auto-height q-mb-md">
      <page-actions :title="settings.useLegacyStructure ? $tr($route.meta.title) : $route.meta.title" />
    </div>
    <!--Content-->
    <div class="relative-position">
      <div class="row q-col-gutter-md">
        <div :class="colClassContent" v-show="showFormAttributes">
          <div class="box">
            <div class="row justify-between items-center q-mb-md">
              <!--Title-->
              <div class="box-title text-primary">
                {{ $tr("isite.cms.message.preview") }}
              </div>
              <!--Actions-->
              <div class="row q-gutter-x-sm">
                <q-btn icon="fa-light fa-up-right-from-square" @click="() => $helper.openExternalURL(iframePreviewUrl)"
                  unelevated outline color="grey-8" size="sm" padding="10px" rounded />
                <q-btn :icon="colClassContent == 'col' ? 'fa-thin fa-maximize' : 'fa-thin fa-minimize'"
                  @click="colClassContent = colClassContent == 'col' ? 'col-12' : 'col'" unelevated outline
                  color="grey-8" size="sm" padding="10px" rounded />
              </div>
            </div>
            <!--Iframe-->
            <div id="iframe-container">
              <iframe name="sample-iframe" frameborder="0" width="100%" :height="`${windowHeigh - 320}px`"></iframe>
              <form name="form-iframe" id="form-iframe" method="post" target="sample-iframe"
                :action="`${baseUrl}/api/ibuilder/v1/block/preview`">
                <div v-for="input in inputsForm" v-html="input.outerHTML" />
              </form>
            </div>
          </div>
        </div>
        <div :class="colClassContent">
          <q-scroll-area :style="`height: ${windowHeigh - 253}px; width: 100%;`">
            <q-form autocorrect="off" autocomplete="off" ref="formContent" @submit="submitData"
              @validation-error="$alert.error($tr('isite.cms.message.formInvalid'))">
              <!--Form block-->
              <dynamic-form v-model="formBlock" :blocks="formFields.block" ref="mainForm" formType="grid" no-actions
                no-reset-with-blocks-update />
              <!--Form Content-->
              <div v-if="contentfieldsconfig.show" class="box box-auto-height q-mb-md">
                <div class="row q-col-gutter-x-md">
                  <!--Title-->
                  <div class="box-title text-primary q-mb-md">
                    {{ formFields.entity.title }}
                  </div>
                  <!-- Entity Content -->
                  <div v-if="contentfieldsconfig.content.length" class="col-12">
                    <div v-for="(field, key) in formFields.entity.fields" :key="key"
                      :class="field.colClass || field.columns || 'col-12 col-md-6'">
                      <dynamic-field v-model="formEntity[field.name || key]" :key="key" :field="field"
                        v-if="field.vIf !== undefined ? field.vIf : true" />
                    </div>
                  </div>
                  <!-- Form Content Fields -->
                  <div class="col-12 no-child-box">
                    <dynamic-form v-if="contentfieldsconfig.contentFields.length" :box-style="false"
                      v-model="formContentFields" :blocks="contentfieldsconfig.contentFields" ref="formContentFields"
                      formType="grid" no-actions />
                  </div>
                </div>
              </div>
              <!--Form Attributes-->
              <div v-if="showFormAttributes" class="box box-auto-height no-child-box q-mb-md">
                <!--Form attributes-->
                <div v-if="elementSelected" class="q-mb-md">
                  <!--Title-->
                  <div class="text-primary q-mb-md">
                    <div class="row justify-between items-center">
                      <b>{{ $trp("isite.cms.label.attribute") }}</b>
                      <q-btn icon="fa-light fa-code-compare" color="green" round class="btn-middle" unelevated outline
                        @click="getTemplates">
                        <q-tooltip>{{ $trp('isite.cms.label.template') }}</q-tooltip>
                      </q-btn>
                    </div>
                  </div>
                  <!-- Tabs elements -->
                  <q-tabs v-model="elementSelected" dense class="bg-grey-2 text-grey-8 q-mb-md" align="justify"
                    active-bg-color="info" indicator-color="grey-2" active-color="white">
                    <q-tab v-for="(element, indexFA) in selectedBlock.block.elements" :key="indexFA"
                      :name="element.systemName" :label="element.title" />
                  </q-tabs>
                  <!-- Tab Panel elements -->
                  <div v-for="(element, indexFA) in selectedBlock.block.elements" :key="indexFA"
                    v-show="elementSelected == element.systemName" class="q-pa-none">
                    <!-- status-->
                    <div class="text-center q-mb-md">
                      <q-btn-toggle v-model="statusChildBlocks[element.name]" class="my-custom-toggle" no-caps rounded
                        unelevated toggle-color="green" color="grey-3" text-color="green" :options="[
  { label: `${element.title} (On)`, value: true },
  { label: `${element.title} (Off)`, value: false }
]" />
                    </div>
                    <!-- forms -->
                    <div v-show="statusChildBlocks[element.name]">
                      <q-separator class="q-mb-md" />
                      <dynamic-form v-model="formAttributes[element.name]" :blocks="element.attributes"
                        formType="collapsible" />
                    </div>
                  </div>
                </div>
              </div>
              <!--Actions-->
              <div class="box box-auto-height text-right">
                <q-btn unelevated rounded no-caps type="submit" :label="$tr('isite.cms.label.save')" color="primary" />
              </div>
            </q-form>
          </q-scroll-area>
        </div>
      </div>
      <!--Inner loading-->
      <inner-loading :visible="loading" />
    </div>
    <!-- Modal Clone -->
    <master-modal v-model="modalTemplates.show" v-bind="modalTemplatesAttributes">
      <file-list-component v-model="templatesAsFiles" :allowSelect="1" gridColClass="col-6 col-md-3"
        @selected="value => modalTemplates.selected = (value[0] || null)" />
    </master-modal>
  </div>
</template>
<script>
import fileListComponent from '@imagina/qsite/_components/master/fileList'

export default {
  beforeDestroy() {
    this.$root.$off('page.data.refresh')
  },
  props: {},
  components: { fileListComponent },
  watch: {
    'formBlock.componentName'() {
      //Reset Values
      this.formEntity = {}
      this.formAttributes = {}
      this.elementSelected = null
      this.statusChildBlocks = {}
    },
    'formEntity.type'() {
      this.$set(this.formEntity, "id", null)
      this.$set(this.formEntity, "params", { "filter": {}, "take": 12 })
    },
  },
  created(){
    this.$watch(vm => [vm.selectedBlock, vm.formEntity, vm.formAttributes], val => { 
      console.log(val);
      if (this.selectedBlock.block && this.selectedBlock.block.nameSpace && Object.keys(this.formEntity).length > 0 && Object.keys(this.formAttributes).length > 0 && this.formAttributes) {
        this.getIframe();
      }
    }, {
      immediate: true, // run immediately
      deep: true // detects changes inside objects. not needed here, but maybe in other cases
    }) 
  },
  mounted() {
    this.$nextTick(function () {
      this.init();
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
      formContentFields: {},
      formAttributes: {},
      notToSnakeCase: ["component", "entity", "attributes"],
      colClassContent: "col",
      windowHeigh: window.innerHeight,
      modalTemplates: {
        show: false,
        loading: false,
        selected: null
      },
      templates: [],
      templatesAsFiles: [],
      statusChildBlocks: {},
      inputsForm: [],
      baseUrl: this.$store.state.qsiteApp.baseUrl,
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
            internalTitle: {
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
                  return { label: item.title, value: item.systemName }
                }),
                readonly: this.blockId ? true : false
              }
            },
            mediasSingle: {
              value: {},
              type: 'media',
              colClass: "col-12",
              fieldItemId: this.blockId || null,
              props: {
                label: this.$tr('isite.cms.message.preview'),
                zone: 'internalimage',
                entity: "Modules\\Ibuilder\\Entities\\Block",
                entityId: null
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
                message: "Configura aquí el contenido del componente..."
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
            return { ...item, name: index }
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
          childBlocks = { mainblock: "x-isite::block", ...childBlocks }
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
        //Timeout to set values
        setTimeout(() => {
          //set defaule element id
          this.elementSelected = Object.values(block.elements)[0].systemName
          //Set blocks status
          Object.values(response.block.elements).forEach(element => {
            this.$set(this.statusChildBlocks, element.name, true)
          })
        }, 100)
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
    //Return the form content
    contentfieldsconfig() {
      //Instance the response
      let response = {
        show: false,
        content: [],
        contentFields: []
      }
      //instance the selected block
      const block = {
        content: [],
        contentFields: {},
        ...(this.selectedBlock?.block || {}),
      }

      //Validate if there is content for this form
      if (block.content.length || Object.keys(block.contentFields).length)
        response = {
          show: true,
          content: block.content,
          contentFields: Object.keys(block.contentFields).length ? [{ fields: block.contentFields }] : []
        }

      //Response
      return response
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
      //Merge attributes with block field
      var attributes = encodeURIComponent(JSON.stringify({
        ...this.formAttributes,
        componentAttributes: {
          ...(this.formAttributes.componentAttributes || {}),
          ...this.formContentFields,
          ...(this.formContentFields[this.$store.state.qsiteApp.defaultLocale] || {})
        }
      }))

      return `${baseUrl}/ibuilder/block/preview?component=${component}&entity=${entity}&attributes=${attributes}`
    },
    //get body params to iframe
    getBodyParams() {
      const component = {
        systemName: this.formBlock.componentName,
        nameSpace: this.selectedBlock.block.nameSpace
      }
      const entity = this.formEntity;
      //Merge attributes with block field
      const attributes = {
        ...this.formAttributes,
        componentAttributes: {
          ...(this.formAttributes.componentAttributes || {}),
          ...this.formContentFields,
          ...(this.formContentFields[this.$store.state.qsiteApp.defaultLocale] || {})
        }
      }
      return { component, entity, attributes }
    },
    //Modal Templates attributes
    modalTemplatesAttributes() {
      return {
        loading: this.modalTemplates.loading,
        customPosition: true,
        title: `${this.$trp('isite.cms.label.template')} | ${this.selectedBlock ? this.selectedBlock.block.title : ''}`,
        actions: [
          {
            props: {
              label: `${this.$tr("isite.cms.label.apply")}: ${this.modalTemplates.selected?.filename || ""}`,
              color: "green",
              rounded: true,
              icon: 'fal fa-fill-drip',
              disable: this.modalTemplates.selected ? false : true
            },
            action: () => {
              this.formAttributes = this.$clone(this.modalTemplates.selected.attributes)
              this.modalTemplates.show = false
            }
          }
        ]
      }
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
        this.getModuleBlocks()
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
            filter: { allTranslations: true, configNameByModule: 'blocks' }
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
        this.modalTemplates = {
          show: true,
          loading: true,
          selected: null
        }
        this.templates = []
        this.templatesAsFiles = []
        //Params
        let requestParams = {
          refresh: true,
          params: {
            filter: { allTranslations: true }
          }
        }
        //Instance the full API for get the blocks(template)
        const templateBaseUrl = `${this.settings.templatesBaseUrl}/api${config('apiRoutes.qbuilder.blocks')}`
        //Request
        this.$axios.get(templateBaseUrl).then(response => {
          //Set templates
          this.templates = this.$clone(response.data.data.filter(block => {
            if (block.component.systemName == this.selectedBlock.block.systemName) return block
          }))
          //Set templates as files
          this.templatesAsFiles = this.$clone(this.templates.map(template => ({
            ...template.mediaFiles.internalimage,
            isImage: true,
            filename: template.internalTitle,
            id: template.id,
            attributes: template.attributes
          })))
          this.modalTemplates.loading = false
          resolve(response)
        }).catch(error => {
          this.modalTemplates.loading = false
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
            filter: { allTranslations: true },
            include: 'fields'
          }
        }
        //Request
        this.$crud.show('apiRoutes.qbuilder.blocks', this.blockId, requestParams).then(response => {
          //Set the form block data
          this.formBlock = this.$clone({ ...response.data, componentName: response.data.component.systemName })
          setTimeout(() => {
            //Set the formEntity data
            this.formEntity = this.$clone(response.data.entity)
            setTimeout(() => {
              this.$set(this.formEntity, "params", response.data.entity.params)
              this.$set(this.formEntity, "id", response.data.entity.id)
              this.formContentFields = this.$clone(response.data)
              //Set the formAttributes data
              const blockAttr = response.data.attributes
              Object.keys(blockAttr).forEach(attrName => {
                if ((blockAttr[attrName] != undefined) && !Array.isArray(blockAttr[attrName])) {
                  this.$set(this.formAttributes, attrName, blockAttr[attrName])
                } else {
                  this.$set(this.statusChildBlocks, attrName, false)
                }
              })
            }, 500)
          }, 500)
          //Resolve
          resolve(response.data)
        }).catch(error => {
          resolve(null)
        })
      })
    },
    //Get the component data
    getBlockRequestData() {
      //Instance the request data
      const requestData = this.$clone({
        ...this.formBlock,
        component: {
          nameSpace: this.selectedBlock.block.nameSpace,
          systemName: this.selectedBlock.block.systemName
        },
        entity: { type: null, id: null, params: {}, ...this.formEntity },
        ...this.formContentFields,
        attributes: this.formAttributes,
      })

      //Remove extra data
      delete requestData.componentName
      delete requestData.helpText
      //Validate the status component attributes
      Object.keys(this.statusChildBlocks).forEach(blockName => {
        if (!this.statusChildBlocks[blockName]) {
          requestData.attributes[blockName] = {}
        }
      })

      //Response
      return requestData
    },
    //getIframe
    getIframe() {
      const bodyParams = this.getBodyParams;
      Object.keys(bodyParams).forEach(field => {
        const input = document.createElement("input");
        input.name = field;
        input.value = JSON.stringify(bodyParams[field]);
        input.type = "hidden";
        this.inputsForm.push(input);
      });
      const submitFormFunction = Object.getPrototypeOf(document.forms["form-iframe"]).submit;
      submitFormFunction.call(document.forms["form-iframe"]);
    },
    //Save data
    submitData() {
      const requestData = this.getBlockRequestData()
      this.blockId ? this.updateBlock(requestData) : this.createBlock(requestData)
    },
    //Create Block
    createBlock(data) {
      return new Promise(resolve => {
        this.loading = true
        //Request params
        const requestParams = { notToSnakeCase: this.notToSnakeCase }
        //request
        this.$crud.create("apiRoutes.qbuilder.blocks", data, requestParams).then(response => {
          this.$router.push({ name: "qbuilder.admin.blocks.index" })
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
        const requestParams = { notToSnakeCase: this.notToSnakeCase }
        //request
        this.$crud.update("apiRoutes.qbuilder.blocks", this.blockId, data, requestParams).then(response => {
          this.$router.push({ name: "qbuilder.admin.blocks.index" })
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
.iframe-test{
  height: 400px;
  width: 400px;
}
</style>
