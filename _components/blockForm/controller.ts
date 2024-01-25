import Vue, {computed, reactive, ref, onMounted, toRefs, watch, getCurrentInstance} from "vue";
import storeEditor from '@imagina/qbuilder/_pages/admin/editor/store'
import {
  ModuleBlockConfig,
  SelectContent,
  Block,
} from '@imagina/qbuilder/_components/blocksPanel/interface'
import dynamicForm from '@imagina/qsite/_components/master/dynamicForm.vue'
import service from '@imagina/qbuilder/_components/blockForm/services'

interface MainData extends Block {
  componentName: string;
}

interface StateProps {
  block: Block,
  indexBlock: number,
  layoutId: number,
  showModal: boolean,
  formBlock: MainData | null,
  configBlock: ModuleBlockConfig,
  languageOptions: any,
  modalActions: any[],
  loading: boolean
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
    layoutId: 0,
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
    ],
    loading: false
  })

  // Computed
  const computeds = {
    //Map the info to dynamic form
    formFields: computed(() => {
      //Main Content about Block
      let blockForm: any[] = [
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
            status: {
              value: '1',
              type: "select",
              colClass: "col-6",
              required: true,
              props: {
                label: `${proxy.$tr('isite.cms.form.status')} *`,
                options: [
                  {label: proxy.$tr('isite.cms.label.enabled'), value: '1'},
                  {label: proxy.$tr('isite.cms.label.disabled'), value: '0'},
                ],
              }
            },
            name: {
              type: "input",
              name: "systemName",
              required: true,
              fakeFieldName: 'component',
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
      if (block.content?.length) blockForm.push(methods.getEntityForm())

      //Content Fields about the selected Block
      if(block.contentFields && Object.keys(block.contentFields).length) blockForm.push(methods.getContentForm(block))

      //Child blocks about the specific block
      if(block.childBlocks) {
        blockForm = [...blockForm, ...(methods.getChildBlocksForm(block))]
      }

      return blockForm
    }),
    //get body params to iframe
    getBlockRequestData: computed(() => {
      //Instance the request data
      const response: any = proxy.$clone({
        ...(state.formBlock ?? {}),
        attributes: {...(state.block.attributes ?? {})},
        sortOrder: state.indexBlock,
        layoutId: state.layoutId
      })

      //Remove extra data
      delete response.helpText
      //Response
      return response
    }),

  }

  // Methods
  const methods = {
    //Fill Block data
    fillBlockData(selectedBlock, {index, layoutId}){
      state.block = proxy.$clone(selectedBlock)
      state.indexBlock = proxy.$clone(index)
      state.layoutId = proxy.$clone(layoutId)

      state.formBlock = proxy.$clone(selectedBlock)

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
    //Get EntityForm
    getEntityForm() {
      const entityData = state.formBlock?.entity
      //Get loadOptions if has Content
      const loadOptions = methods.loadOptionsContent();

      //Return structure of Form
      return {
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
    },
    //Get EntityForm
    getContentForm(block: ModuleBlockConfig) {
      //Get values of Content fields
      const blockContentFields = Object.values(block?.contentFields ?? {})

      //Return structure of Form componentAttributes
      return {
        title: block.title,
        //Map the content Fields and added fakeFieldName like 'componentAttributes'
        fields: blockContentFields.map((field, keyField) => ({
          ...field, fieldItemId: state.block?.id, fakeFieldName: 'componentAttributes', name: (field.name || keyField)
        }))
      }
    },
    //Get Child blocks about the specific block
    getChildBlocksForm(block) {
      const {childBlocks} = block
      const response: any[] = []

      //Loop childBlocks
      Object.keys(childBlocks).forEach(childKey => {
        const systemNameChild = childBlocks[childKey]

        //Get the config of childBlock
        const configBlockChild = methods.getBlockConfig(systemNameChild)

        //Check if exist Content Fields in Child Block
        if(configBlockChild?.contentFields) {
          const blockContentFields = Object.values(configBlockChild.contentFields)

          //Create Form to Child Block
          const childConfigFields = {
            title: `${configBlockChild.title ?? ''}`,
            name: `${childKey}`,
            fields: blockContentFields.map((field, keyField) => ({
              ...field, fakeFieldName: childKey, name: (field.name || keyField)
            }))
          }

          response.push(childConfigFields)
        }
      })

      //Return from for all childBlocks
      return response
    },
    //Save data
    async submitData() {
      const requestData = computeds.getBlockRequestData.value
      await methods.createBlock(requestData)
    },
    //Create Block
    async createBlock(data) {
      state.loading = true
      //Request params
      const requestParams = {notToSnakeCase: ["component", "entity", "attributes"]}

      service.createBlock( data, requestParams).then(response => {
        state.loading = false
        state.showModal = false;
        emit('created', response)
      }).catch(error => {
        state.loading = false
      })
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
