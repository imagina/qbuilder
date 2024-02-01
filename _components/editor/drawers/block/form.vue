<template>
  <div id="builderDrawerBlockForm" :key="attributeKeyTemplate">
    <!--Title-->
    <div  class="drawer-title" style="padding: 16px 24px;">
      <div class="col-4">
        {{getInternalName}}
      </div>
      <div class="col-4 text-center">
        <q-btn-toggle v-if="createMode || selectedBlock" v-model="device"
                        class="my-custom-toggle" no-caps rounded unelevated toggle-color="green" color="grey-3"
                        text-color="green" :options="deviceOptions" v-show="false"/>
      </div>
      <div class="col-4 text-right">
        <!--Close Button-->
        <q-btn @click="closeBlockShow" color="primary" color-text="white" no-caps ripple label= "Cerrar"/>
      </div>
    </div>
    <!--Content-->
    <q-scroll-area style="height: calc(100vh - 136px)">
      <div
        class="padding-drawer-content row"
        style="height: calc(100vh - 200px)"
      >
        <!-- Key -> <pre>{{attributeKeyTemplate}}</pre> -->
        <!--Button Tabs-->
        <div class="col-3">
          <q-tabs
            v-model="editorStore.state.drawers.tabFormSection"
            vertical
            class="text-primary-builder"
            active-bg-color="primary-builder"
            active-color="white"
            no-caps
            indicator-color="primary-builder"
            content-class="text-right"
          >
            <q-tab name="main" label="Main" />
            <q-tab name="content" :label="$trp('isite.cms.label.content')" v-show="blockConfig"/>
            <q-tab name="attributes" label="Attributes" v-show="blockConfig"/>
          </q-tabs>
        </div>
        <!-- Form  Content-->
        <div class="col-9" v-if="selectedBlock">
          <q-tab-panels
            v-model="editorStore.state.drawers.tabFormSection"
            animated
            vertical
            keep-alive
            transition-prev="jump-up"
            transition-next="jump-up"
          >
            <!--Main Fields-->
            <q-tab-panel name="main">
              <dynamic-form
                v-model="formMainFields"
                :blocks="mainFields"
                ref="main-form"
                formType="grid"
                no-actions
                default-col-class="col-12"
                :box-style="false"
              />
            </q-tab-panel>
            <!--Entity Fields-->
            <q-tab-panel name="content">
              <dynamic-form
                v-model="formEntityFields"
                :blocks="entityFields"
                ref="content-form"
                formType="grid"
                no-actions
                v-if="selectedBlock && blockConfig && blockConfig.content.length"
                default-col-class="col-12"
                no-reset-with-blocks-update
                :box-style="false"
              />
              <dynamic-form
                v-if="contentFieldsConfig.contentFields.length"
                :box-style="false"
                v-model="formExtraFields"
                :blocks="contentFieldsConfig.contentFields"
                ref="formContentFields"
                formType="grid"
                no-actions
              />
            </q-tab-panel>
            <q-tab-panel name="attributes" class="column">
              <q-btn v-if="blockConfig.elements && selectedBlock" v-for="(element, indexFA) in blockConfig.elements" :key="indexFA" :label="element.title" color="primary-builder" class="full-width q-mb-md" @click="() => setElementSelected(element.systemName)"/>
            </q-tab-panel>
          </q-tab-panels>
        </div>
        <div class="col-9" v-else>
          <q-tab-panels
            v-model="editorStore.state.drawers.tabFormSection"
            animated
            vertical
            keep-alive
            transition-prev="jump-up"
            transition-next="jump-up"
          >
            <!--Main Fields-->
            <q-tab-panel name="main">
              <dynamic-form
                v-model="formMainFields"
                :blocks="mainFields"
                ref="main-form"
                formType="grid"
                no-actions
                default-col-class="col-12"
                :box-style="false"
              />
            </q-tab-panel>
            <!--Entity Fields-->
            <q-tab-panel name="content">
              <dynamic-form
                v-if="formMainFields.componentName"
                v-model="formEntityFields"
                :blocks="entityFields"
                ref="content-form"
                formType="grid"
                no-actions
                default-col-class="col-12"
                no-reset-with-blocks-update
                :box-style="false"
              />
              <dynamic-form
                v-if="contentFieldsConfig.contentFields.length"
                :box-style="false"
                v-model="formExtraFields"
                :blocks="contentFieldsConfig.contentFields"
                ref="formContentFields"
                formType="grid"
                no-actions
              />
              <dynamic-field v-if="!formMainFields.componentName && !contentFieldsConfig.contentFields.length" :field="tabsInfo.content.fields.helpText" />
            </q-tab-panel>
            <q-tab-panel name="attributes" class="column">
              <div v-if="blockConfig && blockConfig.elements !== undefined">
                <q-btn v-for="(element, indexFA) in blockConfig.elements" :key="indexFA" :label="element.title" color="primary-builder" class="full-width q-mb-md" @click="() => setElementSelected(element.systemName)"/>
              </div>
              <dynamic-field v-else :field="tabsInfo.attributes.fields.helpText" />
            </q-tab-panel>
          </q-tab-panels>
        </div>
      </div>
    </q-scroll-area>
    <saveButton />
  </div>
</template>
<script>

import Vue, {computed} from "vue";
import editorStore from "@imagina/qbuilder/_store/editor";
import saveButton from '@imagina/qbuilder/_components/editor/drawers/block/saveButton.vue'

export default {
  setup(){
    return {
      createMode: computed(() => editorStore.state.createMode),
      device: editorStore.models.device,
      editorStore
    }
  },
  props: {},
  components: {
    saveButton
  },
  watch: {
    selectedBlock(newValue) {
      if (newValue) {
        this.setFormMainFields();
        this.setFormContentFields();
        this.formMainFieldsKey = this.$uid();
      } else {
        this.resetFormMainFields();
        this.resetFormContentFields();
      }
    },
    blockConfig(){
      this.setBlockConfig(this.blockConfig);
    },
  },
  beforeDestroy() {
    this.$eventBus.$off('updateBlockInfo')
    this.$eventBus.$off('saveBlockInfo')
  },
  mounted() {
    this.$nextTick(function () {
      this.init();
    });
  },
  data() {
    return {
      blocksConfiguration: editorStore.models.blocksConfiguration,
      formMainFields: editorStore.models.formMainFields,
      formEntityFields: editorStore.models.formEntityFields,
      formExtraFields: editorStore.models.formExtraFields,
      statusChildBlocks: editorStore.models.statusChildBlocks,
      blocks: editorStore.models.blocks,
      languageOptions: this.$store.getters["qsiteApp/getSelectedLocalesSelect"],
      formMainFieldsKey: this.$uid(),
      isValidForm: false,
      notToSnakeCase: ["component", "entity", "attributes", "mobileAttributes"],
    };
  },
  computed: {
    attributeKeyTemplate: () => editorStore.state.attributesKeyTemplate,
    drawers: () => editorStore.state.drawers,
    formAttributesFields: () => editorStore.state.formAttributesFields,
    formMobileAttributesFields: () => editorStore.state.formMobileAttributesFields,
    elementSelected: () => editorStore.state.elementSelected,
    //Return the state of selectedBlock from the editor store
    selectedBlock: () => editorStore.state.selectedBlock,
    //Return the block config of the block choosed in the main fields
    blockConfig() {
      const block = Object.values(this.blocksConfiguration).find((block) => {
        return block.systemName == this.formMainFields.componentName;
      });
      if(this.formMainFields.componentName){
        // Object.values(block.elements).forEach(element => {
        //   this.setStatusChildBlock(element.name, true);
        // })
        this.formMainFieldsKey = this.$uid()
      }
      return block;
    },
    //Return the fields for Main fields section
    mainFields() {
      return [
        {
          name: "main",
          fields: {
            helpText: {
              type: "banner",
              props: {
                message:
                  "Selecciona un 'Nombre de Sistema' unico que identifique el bloque y luego el componente que quieres perzonalizar...",
              },
            },
            internalTitle: {
              isTranslatable: true,
              type: "input",
              required: true,
              props: {
                label: this.$tr("isite.cms.form.title") + "*",
                rules: [
                  (val) => !!val || this.$tr("isite.cms.message.fieldRequired"),
                ],
              },
            },
            systemName: {
              type: "input",
              required: true,
              props: {
                label: this.$tr("isite.cms.form.systemName") + "*",
              },
            },
            componentName: {
              type: "select",
              required: true,
              props: {
                label: this.$tr("isite.cms.label.block") + "*",
                options: Object.values(this.blocksConfiguration)
                  .filter((item) => !item.internal)
                  .map((item) => {
                    return { label: item.title, value: item.systemName };
                  }),
                readonly: this.selectedBlock?.id ? true : false,
              },
            },
            mediasSingle: {
              value: {},
              type: "media",
              fieldItemId: this.selectedBlock?.id || null,
              props: {
                label: this.$tr("isite.cms.message.preview"),
                zone: "internalimage",
                entity: "Modules\\Ibuilder\\Entities\\Block",
                entityId: null,
              },
            },
          },
        },
      ];
    },
    //Return the fields for Entity fields section
    entityFields() {
      //Search and instance the loadOptions config to request the entityId options
      let loadOptionsForEntityId = this.blockConfig.content.find(
        (item) => item.value == this.formEntityFields.type
      );
      loadOptionsForEntityId = loadOptionsForEntityId?.loadOptions || null;

      //Instance and return the response
      return [
        {
          fields: {
            helpText: {
              type: "banner",
              props: {
                message: "Configura aquí el contenido del componente...",
              },
            },
            type: {
              type: "select",
              require: true,
              vIf: !!this.blockConfig.content.length ? true : false,
              props: {
                label: `${this.$tr("isite.cms.label.entity")}*`,
                rules: [
                  (val) => !!val || this.$tr("isite.cms.message.fieldRequired"),
                ],
                options: this.blockConfig.content,
              },
            },
            id: {
              type: "select",
              require: true,
              vIf: loadOptionsForEntityId ? true : false,
              props: {
                label: `${this.$tr("isite.cms.label.record")}*`,
                rules: [
                  (val) => !!val || this.$tr("isite.cms.message.fieldRequired"),
                ],
              },
              loadOptions: loadOptionsForEntityId,
            },
            params: {
              type: "json",
              require: true,
              vIf:
                this.formEntityFields.type && !loadOptionsForEntityId
                  ? true
                  : false,
              props: {
                label: this.$trp("isite.cms.label.filter"),
                rules: [
                  (val) => !!val || this.$tr("isite.cms.message.fieldRequired"),
                ],
              },
            },
          },
        },
      ];
    },
    //Return the fields for Extra fields section
    //Set content fields config
    contentFieldsConfig() {
      let response = {
        content: [],
        contentFields: []
      };

      const block = {
        content: [],
        contentFields: {},
        ...(this.blockConfig || {})
      };

      if (block.content.length || Object.keys(block.contentFields).length) {
        const blockContentFields = !Object.keys(block.contentFields).length ? [] : Object.values(block.contentFields);
        response = {
          content: block.content,
          contentFields: [{
            fields: [
              ...blockContentFields.map((field, keyField) => ({
                ...field, fieldItemId: this.blockId, name: (field.name || keyField)
              })),
              //block bg image
              {
                name: 'mediasSingle',
                value: {},
                type: 'media',
                colClass: 'col-12',
                fieldItemId: this.selectedBlock?.id || null,
                props: {
                  label: this.$tr('isite.cms.label.backgroundImage'),
                  zone: 'blockbgimage',
                  entity: "Modules\\Ibuilder\\Entities\\Block",
                  entityId: null
                }
              }
            ]
          }]
        }
      }
      return response
    },
    tabsInfo(){
      return  {
        content: {
          fields: {
            helpText: {
              type: "banner",
              colClass: "col-12",
              props: {
                message: "Selecciona un 'Bloque'. Luego podras Configurar aquí el contenido del componente."
              }
            }
          }
        },
        attributes: {
          fields: {
            helpText: {
              type: "banner",
              colClass: "col-12",
              props: {
                message: "Selecciona un 'Bloque' y una 'Entidad'. Luego podras personalizar sus atributos."
              }
            }
          }
        }
      }
    },
    getInternalName() {
      return (this.selectedBlock && this.formMainFields ? this.formMainFields[this.$store.state.qsiteApp.defaultLocale].internalTitle : 'New Block' )
    },
    deviceOptions(){
      return [{label: '', value: 0, icon: 'phone_iphone'}, {label: '', value: 1, icon: 'desktop_windows'}]
    }
  },
  methods: {
    init() {
      editorStore.methods.getBlocksConfiguration(true);
      this.$eventBus.$on('updateBlockInfo', () => {
        this.updateBlock();
      })
      this.$eventBus.$on('saveBlockInfo', () => {
        this.createBlock();
      })
    },
    setStatusChildBlock: editorStore.methods.setStatusChildBlock,
    setBlockConfig: editorStore.methods.setBlockConfig,
    async updateBlock(){
      await this.validateForms()
      if (this.isValidForm) {
        const data = this.getBlockData();
        const requestParams = {notToSnakeCase: this.notToSnakeCase}
        editorStore.state.loading = true
        editorStore.setLastSelectedBlock(this.selectedBlock.id)
        this.$crud.update("apiRoutes.qbuilder.blocks", this.selectedBlock.id, data, requestParams).then(() => this.$router.go());
      }
    },
    async createBlock(){
      await this.validateForms()
      if (this.isValidForm) {
        const data = this.getBlockData();
        const requestParams = {notToSnakeCase: this.notToSnakeCase}
        editorStore.state.loading = true
        this.$crud.create("apiRoutes.qbuilder.blocks", data, requestParams).then(() => this.$router.go());
      }
    },
    async validateForms() {
      let isValidMainForm = false
      let isValidContentForm = false

      if (this.$refs['main-form']) {
        isValidMainForm = await this.$refs['main-form'].validateCompleteForm();
        if(!isValidMainForm){
          editorStore.state.drawers.tabFormSection = 'main'
        }
      }

      if (this.$refs['content-form']){
        isValidContentForm = await this.$refs['content-form'].validateCompleteForm();
        if(!isValidContentForm){
          editorStore.state.drawers.tabFormSection = 'content'
        }
      } else {
        //force the message if the content-form isn't ready or hidden
        if(editorStore.state.createMode){
          if(isValidMainForm){
            const msg = `${this.$tr('isite.cms.message.formInvalid')} ${this.$trp('isite.cms.label.content')}`
            this.$alert.error(msg)
            // goto content tab
            editorStore.state.drawers.tabFormSection = 'content'
          }
        }
      }
      if(editorStore.state.createMode){
        this.isValidForm = isValidMainForm && isValidContentForm
      } else {
        this.isValidForm = isValidMainForm || isValidContentForm
      }
    },
    deleteExtraKeys(obj){
      const attributesKeys = Object.keys(obj);
      if (attributesKeys.includes('effect') && attributesKeys.includes('effect')) {
        delete obj['effect']
        delete obj['value']
      }
    },
    getBlockData(){
      this.deleteExtraKeys(this.formAttributesFields);
      this.deleteExtraKeys(this.formMobileAttributesFields);
      const response = {
        ...this.formMainFields,
        internalTitle: this.formMainFields[this.$store.state.qsiteApp.defaultLocale].internalTitle,
        component: {
          nameSpace: this.blockConfig?.nameSpace || "",
          systemName: this.blockConfig?.systemName || ""
        },
        ...this.formExtraFields,
        entity: {type: null, id: null, params: {}, ...this.formEntityFields},
        attributes: {...this.formAttributesFields},
        mobileAttributes: {...this.formMobileAttributesFields},
        mediasSingle: {
          ...(this.formExtraFields.medias_single || this.formExtraFields.mediasSingle || {}),
          ...(this.formMainFields.mediasSingle || this.formMainFields.medias_ingle || {})
        },
        mediasMulti: {
          ...(this.formExtraFields.medias_multi || this.formExtraFields.mediasMulti || {}),
          ...(this.formMainFields.medias_multi || this.formMainFields.mediasMulti || {})
        },
      }

      this.languageOptions.forEach(lang => {
        response[lang.value] = {
          ...this.formExtraFields[lang.value],
          internalTitle: this.formMainFields[lang.value]?.internalTitle,
        }
      })
      response.attributes.componentAttributes = {
        ...response.attributes.componentAttributes,
        mediasSingle: response.mediasSingle,
        mediasMulti: response.mediasMulti
      }
      response.attributes.mainblock = response.attributes.mainBlock;
      response.mobileAttributes.mainblock = response.mobileAttributes.mainBlock;
      delete response.attributes.mainBlock;
      delete response.mobileAttributes.mainBlock;
      //Remove extra data
      delete response.componentName
      delete response.helpText
      delete response.medias_single
      delete response.medias_multi

      response.internalTitle = this.formMainFields[this.$store.state.qsiteApp.defaultLocale].internalTitle;

      Object.keys(this.statusChildBlocks).forEach(blockName => {
        const blockAttrStatus = this.statusChildBlocks[blockName];
        if (blockName === 'mainBlock') blockName = 'mainblock';
        if (!blockAttrStatus) {
          response.attributes[blockName].propertiesStatus = false;
          response.mobileAttributes[blockName].propertiesStatus = false;
        }else{
          response.attributes[blockName].propertiesStatus = true;
          response.mobileAttributes[blockName].propertiesStatus = true;
        }
      })

      return response;
    },
    //Close the form block drawer and back to the list
    closeBlockShow: editorStore.methods.closeBlockShow,

    setFormMainFields() {
      const { systemName } = this.selectedBlock;
      const { mediasSingle } = this.selectedBlock.attributes.componentAttributes;
      const componentName = this.selectedBlock.component.systemName;
      const fields = {

        componentName,
        ...this.selectedBlock
      };
      this.formMainFields = fields;
    },

    setFormContentFields(){
      const { id, params, type } = this.selectedBlock.entity;
      const fields = {
        id,
        params,
        type
      }
      this.formEntityFields = fields;
      const extraFieldsBlock = this.blocks.find(block => block.systemName === this.formMainFields.systemName);
      this.formExtraFields = {...extraFieldsBlock};
    },

    resetFormMainFields(){
      this.formMainFields = {};
    },

    resetFormContentFields(){
      this.formEntityFields = {};
    },

    setElementSelected(elementSelected){
      editorStore.methods.setElementSelected(elementSelected);
    },
  },

};
</script>
<style lang="sass">
#builderDrawerBlockForm
  .q-tabs
    border-right: 1px solid $grey-3
    min-height 100%

  .q-tab
    width: max-content
    float: right
    border-radius 10px 0 0 10px
</style>
