import Vue, {computed, reactive, ref, onMounted, toRefs, watch, getCurrentInstance} from "vue";
import storeEditor from '@imagina/qbuilder/_pages/admin/editor/store'
import {
  ModuleBlockConfig,
  SelectContent,
  Block,
  Entity,
  Params
} from '@imagina/qbuilder/_components/blocksPanel/interface'

interface MainData extends Block {
  componentName: string;
}

interface ContentData extends Block {
  type:   string;
  params: Params | null;
}

interface ResponseOrderedData {
  block: MainData;
  content: ContentData;
  entity: Entity;
}

interface StateProps {
  formBlock: MainData | null,
  dataContentBlock: ContentData | null,
  contentData: any,
  configBlock: ModuleBlockConfig,
  languageOptions: any,
  formEntity: any
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
    dataContentBlock: null,
    contentData: null,
    configBlock: {} as ModuleBlockConfig,
    languageOptions: proxy.$store.getters['qsiteApp/getSelectedLocalesSelect'],
    formEntity: {},
  })

  // Computed
  const computeds = {
    //Return the form content
    contentfieldsconfig: computed(() => {
      //Instance the response
      let response: {show: boolean; content: SelectContent[]; contentFields: any[]} = {
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
      return {
        block: [
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
          }
        ],
        entity: {
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
              vIf: methods.loadOptionsContent() ? true : false,
              props: {
                label: `${proxy.$tr('isite.cms.label.record')}*`,
                rules: [
                  val => !!val || proxy.$tr('isite.cms.message.fieldRequired')
                ]
              },
              loadOptions: methods.loadOptionsContent()
            },
            params: {
              type: "json",
              require: true,
              colClass: "col-12",
              vIf: (state.formEntity.type && !methods.loadOptionsContent()) ? true : false,
              props: {
                label: proxy.$tr('isite.cms.label.filter'),
                rules: [
                  val => !!val || proxy.$tr('isite.cms.message.fieldRequired')
                ]
              }
            },
          }
        },
      }
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
        entity: {type: null, id: null, params: {}, ...state.formEntity},
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
    //Order the information, so you can use it in the form
    orderBlockSelect: (): ResponseOrderedData => {
      const blockSelected = props.block
      return {
        block: {
          ...blockSelected,
          componentName: blockSelected.component.systemName
        },
        content: {
          ...blockSelected,
        },
        entity: {
          ...blockSelected.entity,
        }
      }
    },
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
    const orderedData = methods.orderBlockSelect()
    state.formEntity = orderedData.entity
    state.formBlock = orderedData.block
    state.dataContentBlock = orderedData.content

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
