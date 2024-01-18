import Vue, {computed, reactive, ref, onMounted, toRefs, watch, getCurrentInstance} from "vue";
import storeEditor from '@imagina/qbuilder/_pages/admin/editor/store'
import {
  ModuleBlockConfig,
  SelectContent,
  Block,
} from '@imagina/qbuilder/_components/blocksPanel/interface'

interface MainData extends Block {
  componentName: string;
}

interface StateProps {
  formBlock: MainData | null,
  configBlock: ModuleBlockConfig,
  languageOptions: any,
}


export default function controller(props: any, emit: any) {
  const proxy = (getCurrentInstance() as { proxy: Vue }).proxy as Vue

  // Refs
  const refs = {
    // refKey: ref(defaultValue)
  }

  // States
  const state = reactive<StateProps>({
    formBlock: null,
    configBlock: {} as ModuleBlockConfig,
    languageOptions: proxy.$store.getters['qsiteApp/getSelectedLocalesSelect']
  })

  // Computed
  const computeds = {
    //Return the form content
    contentfieldsconfig: computed(() => {
      //Instance the response
      let response = {
        show: false,
        content: [],
        contentFields: []
      }
      //instance the selected block
      const block: ModuleBlockConfig = state.configBlock || {}

      //Validate if there is content for this form
      if (block.content?.length || (block.contentFields && Object.keys(block.contentFields).length)) {
        const contenFields = block.contentFields ?? {};
        const blockContentFields = !Object.keys(contenFields).length ? [] : Object.values(contenFields)
        response = {
          show: true,
          content: block.content ?? [],
          contentFields: [{
            fields: [
              {
                name: 'blockTitle',
                type: 'input',
                colClass: 'col-12',
                isTranslatable: true,
                props : {
                  label : proxy.$tr('isite.cms.form.title')
                }
              },
              {
                name: 'blockSubtitle',
                type: 'input',
                colClass: 'col-12',
                isTranslatable: true,
                props : {
                  label : proxy.$tr('isite.cms.label.subtitle')
                }
              },
              ...blockContentFields.map((field, keyField) => ({
                ...field, fieldItemId: props.block.id, name: (field.name || keyField)
              })),
              //block bg image
              {
                name: 'mediasSingle',
                value: {},
                type: 'media',
                colClass: 'col-12',
                fieldItemId: props.block.id,
                props: {
                  label: proxy.$tr('isite.cms.label.backgroundImage'),
                  zone: 'blockbgimage',
                  entity: "Modules\\Ibuilder\\Entities\\Block",
                  entityId: null
                }
              }
            ]
          }]
        }
      }
      //Response
      return response
    }),
    //Map the info to dynamic form
    formFields: computed(() => {
      const blockForm: any[] = [
        {
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
              colClass: "col-12",
              props: {
                label: proxy.$tr("isite.cms.form.title") + "*",
                rules: [
                  val => !!val || proxy.$tr('isite.cms.message.fieldRequired')
                ],
              }
            },
            systemName: {
              type: "input",
              required: true,
              colClass: "col-12",
              props: {
                label: proxy.$tr("isite.cms.form.systemName") + "*"
              }
            },
            componentName: {
              type: "input",
              required: true,
              colClass: "col-12",
              props: {
                label: proxy.$tr("isite.cms.label.block") + "*",
                readonly: true
              }
            }
          }
        },
      ];

      //instance the selected block
      const block: ModuleBlockConfig = state.configBlock || {}

      if (block.content?.length) {
        const entityData = state.formBlock?.entity
        const loadOptions = methods.loadOptionsContent();

        const entityForm = {
          title: proxy.$tr("isite.cms.label.content"),
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
              colClass: "col-12" ,
              fakeFieldName: 'entity',
              props: {
                label: `${proxy.$tr('isite.cms.label.entity')}*`,
                rules: [
                  val => !!val || proxy.$tr('isite.cms.message.fieldRequired')
                ],
                options: state.configBlock?.content || []
              }
            },
            id: {
              type: "select",
              require: true,
              fakeFieldName: 'entity',
              vIf: !!loadOptions,
              props: {
                label: `${proxy.$tr('isite.cms.label.record')}*`,
                rules: [
                  val => !!val || proxy.$tr('isite.cms.message.fieldRequired')
                ]
              },
              loadOptions: loadOptions
            },
            params: {
              type: "json",
              require: true,
              colClass: "col-12",
              fakeFieldName: 'entity',
              vIf: (entityData?.type && !!!loadOptions) ? true : false,
              props: {
                label: proxy.$tr('isite.cms.label.filter'),
                rules: [
                  val => !!val || proxy.$tr('isite.cms.message.fieldRequired')
                ]
              }
            },
          }
        }

        blockForm.push(entityForm)
      }

      return blockForm
    }),
    //get body params to iframe
    getBlockRequestData: computed(() => {
      //Instance the request data
      const response: any = proxy.$clone({
        ...(state.formBlock ?? {}),
        component: {
          nameSpace: state.configBlock?.nameSpace || "",
          systemName: state.configBlock?.systemName || ""
        },
        // ...this.formContentFields,
        // entity: {type: null, id: null, params: {}, ...state.formEntity},
        // mediasSingle: this.$clone({
        //   ...(this.formContentFields.medias_single || this.formContentFields.mediasSingle || {}),
        //   ...(this.formBlock.mediasSingle || this.formBlock.medias_ingle || {})
        // }),
        // mediasMulti: this.$clone({
        //   ...(this.formContentFields.medias_multi || this.formContentFields.mediasMulti || {}),
        //   ...(this.formBlock.medias_multi || this.formBlock.mediasMulti || {})
        // }),
      })
      // //Merge translations
      // this.languageOptions.forEach(lang => {
      //   response[lang.value] = {
      //     ...this.formContentFields[lang.value],
      //     internalTitle: this.formBlock[lang.value]?.internalTitle,
      //   }
      // })
      // // //Remove extra data
      console.log(response)
      delete response.componentName
      // // delete response.helpText
      // // delete response.medias_single
      // // delete response.medias_multi
      // // //Validate the status component attributes
      // // Object.keys(this.statusChildBlocks).forEach(blockName => {
      // //   if (!this.statusChildBlocks[blockName]) {
      // //     response.attributes[blockName] = {}
      // //   }
      // // })
      // //Response
      // return response
    }),

  }

  // Methods
  const methods = {
    //Load content options
    loadOptionsContent() {
      let response: SelectContent | null = null

      //Check if there is a configuration block in the state
      if (state.configBlock?.content) {
        // Find the element that matches the given entity type
        response = state.configBlock.content.find(item => {
          if (item.value == props.block.entity.type) return item
        })!
      }

      // Return load options if they exist
      return response?.loadOptions || null
    },
    //Save data
    async submitData() {
      console.log(computeds.getBlockRequestData.value)
      // if (this.$refs.mainForm) {
      //   this.isValidForm = await this.$refs.mainForm.validateCompleteForm();
      // }
      // //Send data if form is valid
      // if (this.isValidForm) {
      //   const requestData = this.getBlockRequestData
      //   this.blockId ? this.updateBlock(requestData, saveAndReturn) : this.createBlock(requestData)
      // } else {
      //   this.$alert.error(this.$tr('isite.cms.message.formInvalid'))
      // }
    },
  }

  // Mounted
  onMounted(() => {
    state.formBlock = {
      ...proxy.$clone(props.block),
      componentName: props.block.component.systemName
    }

    //Find the configuration of the block you selected
    state.configBlock =
      storeEditor.blockConfigs?.find(
        block => block.systemName === props.block.component.systemName
      ) ?? {} as ModuleBlockConfig;
  })

  // Watch
  // watch(key, (newField, oldField): void => {
  //
  // }, {deep: true})

  return {...refs, ...(toRefs(state)), ...computeds, ...methods}
}
