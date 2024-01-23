import Vue, {computed, reactive, ref, onMounted, toRefs, watch, getCurrentInstance} from "vue";
import storeEditor from '@imagina/qbuilder/_pages/admin/editor/store'
import {
  ModuleBlockConfig,
  SelectContent,
  Block,
} from '@imagina/qbuilder/_components/blocksPanel/interface'
import dynamicForm from '@imagina/qsite/_components/master/dynamicForm.vue'

interface MainData extends Block {
  componentName: string;
}

interface StateProps {
  block: Block,
  indexBlock: number,
  showModal: boolean,
  formBlock: MainData | null,
  configBlock: ModuleBlockConfig,
  languageOptions: any,
  modalActions: any[]
}


export default function controller(props: any, emit: any) {
  const proxy = (getCurrentInstance() as { proxy: Vue }).proxy as Vue

  // Refs
  const refs = {
    refForm: ref<typeof dynamicForm>()
  }

  // States
  const state = reactive<StateProps>({
    block: {} as Block,
    indexBlock: 1,
    showModal: false,
    formBlock: null,
    configBlock: {} as ModuleBlockConfig,
    languageOptions: proxy.$store.getters['qsiteApp/getSelectedLocalesSelect'],
    modalActions: [
      {
        props: {
          label: proxy.$tr('isite.cms.label.save'),
          color: 'green',
        },
        action: () => refs.refForm.value?.changeStep('next', true)
      }
    ]
  })

  // Computed
  const computeds = {
    //Map the info to dynamic form
    formFields: computed(() => {
      //Main Content about Block
      const blockForm: any[] = [
        {
          name: "main",
          title: proxy.$tr("ibuilder.cms.label.system"),
          fields: {
            helpText: {
              type: "banner",
              colClass: "col-12",
              props: {
                message: proxy.$tr("ibuilder.cms.label.bannerMessage")
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
            gridPosition: {
              value: 'col-md-12',
              type: "input",
              required: true,
              colClass: "col-6",
              props: {
                label: `${proxy.$tr('isite.cms.label.gridPosition')} *`
              }
            },
            sortOrder: {
              value: state.indexBlock,
              type: "input",
              colClass: "col-6",
              props: {
                label: proxy.$tr("ibuilder.cms.label.sortPosition"),
                readonly: true
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

      //Entity Form
      if (block.content?.length) {
        const entityData = state.formBlock?.entity
        const loadOptions = methods.loadOptionsContent();

        const entityForm = {
          title: proxy.$tr("isite.cms.label.entity"),
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

      //Content Fields about the selected Block
      if(block.contentFields && Object.keys(block.contentFields).length) {
        const blockContentFields = Object.values(block.contentFields)

        const firstLevel = {
          title: block.title,
          fields: blockContentFields.map((field, keyField) => ({
              ...field, fieldItemId: state.block?.id, fakeFieldName: 'mainComponentAttributes', name: (field.name || keyField)
            }))
        }

        blockForm.push(firstLevel)
      }

      //Child blocks about the specific block
      if(block.childBlocks) {
        const {childBlocks} = block
        Object.keys(childBlocks).forEach(childKey => {
          const systemNameChild = childBlocks[childKey]

          const configBlockChild = methods.getBlockConfig(systemNameChild)


          if(configBlockChild?.contentFields) {
            const blockContentFields = Object.values(configBlockChild.contentFields)

            const childConfigFields = {
              title: `${configBlockChild.title ?? ''}`,
              name: `${childKey}`,
              fields: blockContentFields.map((field, keyField) => ({
                  ...field, fakeFieldName: childKey, name: (field.name || keyField)
                }))
            }

            blockForm.push(childConfigFields)
          }
        })
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
    //Fill Block data
    fillBlockData(selectedBlock, index){
      state.block = proxy.$clone(selectedBlock)
      state.indexBlock = proxy.$clone(index)

      state.formBlock = {
        ...proxy.$clone(selectedBlock),
        componentName: selectedBlock.component?.systemName
      }

      //Search the selected block configuration
      state.configBlock = methods.getBlockConfig(selectedBlock.component?.systemName)

      state.showModal = true
    },
    //Load content options
    loadOptionsContent() {
      let response: SelectContent | null = null

      //Check if there is a configuration block in the state
      if (state.configBlock?.content) {
        // Find the element that matches the given entity type
        response = state.configBlock.content.find(item => {
          if (item.value == state.block?.entity?.type) return item
        })!
      }

      // Return load options if they exist
      return response?.loadOptions || null
    },
    //Find Config about Block
    getBlockConfig(systemName: string) {
      return storeEditor.blockConfigs?.find(
        block => block?.systemName === systemName
      ) ?? {} as ModuleBlockConfig;
    },
    //Save data
    async submitData() {
      console.warn(state.formBlock, state.block);
      // console.log(computeds.getBlockRequestData.value)
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
  })

  // Watch
  // watch(key, (newField, oldField): void => {
  //
  // }, {deep: true})

  return {...refs, ...(toRefs(state)), ...computeds, ...methods}
}
