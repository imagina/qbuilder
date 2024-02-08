import Vue, {computed, reactive, ref, onMounted, toRefs, watch, getCurrentInstance} from "vue";
import storeEditor from '@imagina/qbuilder/_pages/admin/editor/store'
import {
  ModuleBlockConfig,
  SelectContent,
  Block,
} from '@imagina/qbuilder/_components/blocksPanel/interface'
import dynamicForm from '@imagina/qsite/_components/master/dynamicForm.vue'
import service from '@imagina/qbuilder/_components/blockContentForm/services'
import {helper} from '@imagina/qsite/_plugins/helper'

interface MainData extends Block {
  componentName: string;
}

interface StateProps {
  block: Block,
  idBlock: number | null,
  indexBlock: number,
  layoutId: number,
  parentSystemName: string | null,
  showModal: boolean,
  formBlock: MainData | null,
  configBlock: ModuleBlockConfig,
  languageOptions: any,
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
    idBlock: null,
    indexBlock: 1,
    layoutId: 0,
    parentSystemName: null,
    showModal: false,
    formBlock: null,
    configBlock: {} as ModuleBlockConfig,
    languageOptions: proxy.$store.getters['qsiteApp/getSelectedLocalesSelect'],
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
            systemName: {
              type: "input",
              required: true,
              fakeFieldName: 'component',
              colClass: "col-12",
              props: {
                label: proxy.$tr("isite.cms.label.block") + "*",
                readonly: true
              }
            },
            mediasSingle: {
              value: {},
              type: 'media',
              colClass: "col-12",
              fieldItemId: state.idBlock || null,
              props: {
                label: proxy.$tr('isite.cms.message.preview'),
                zone: 'internalimage',
                entity: "Modules\\Ibuilder\\Entities\\Block",
                entityId: null
              }
            }
          }
        },
      ];

      //instance the selected block
      const block: ModuleBlockConfig = state.configBlock || {}

      //Entity Form
      if (block.content?.length) blockForm.push(methods.getEntityForm())

      return blockForm
    }),
    //get body params to iframe
    getBlockRequestData: computed(() => {
      // Determine which object to use as base
      const baseObject = state.idBlock ? {...state.block, ...state.formBlock} : state.formBlock;

      // Clone the base object
      let response: any = proxy.$clone({
        ...baseObject,
        ...(state.idBlock ? {} : {
          systemName: proxy.$uid(),
          attributes: {...(state.block?.attributes ?? {})},
          sortOrder: state.indexBlock,
          parentSystemName: state.parentSystemName,
          layoutId: state.layoutId
        })
      });

      if (!response.entity) response.entity = {}

      //Merge translations
      state.languageOptions.forEach(lang => {
        const locale = lang.value
        const formLocaleData = state.formBlock ?? {}
        response[locale] = {
          ...state.block[locale],
          ...(formLocaleData[locale] ?? {}),
        }

        response = {
          ...response,
          ...(formLocaleData[locale] ?? {}),
        }
      })

      //Remove extra data
      delete response.helpText
      //Response
      return response
    }),
    //get modal Actions
    modalActions: computed(() => {
      const buttonLabel = state.idBlock ? proxy.$tr('ibuilder.cms.label.apply') : proxy.$tr('isite.cms.label.save')
      return [
        {
          props: {
            label: buttonLabel,
            color: 'green',
          },
          action: () => refs.refForm.value?.changeStep('next', true)
        }
      ]
    }),

  }

  // Methods
  const methods = {
    //Fill in data for creation with selected block
    fillData(selectedBlock, {index, layoutId, parentSystemName}){
      // Cloning and setting selected block data
      state.block = proxy.$clone(selectedBlock)
      state.indexBlock = proxy.$clone(index)
      state.layoutId = proxy.$clone(layoutId)
      state.parentSystemName = proxy.$clone(parentSystemName)

      // Cloning and setting form block data
      state.formBlock = proxy.$clone(selectedBlock)

      // Retrieving and setting block configuration
      state.configBlock = methods.getBlockConfig(selectedBlock.component?.systemName)

      // Displaying the modal
      state.showModal = true
    },
    //Fill in data for update with selected block
    updateData(selectedBlock){
      // Cloning and setting selected block data
      state.block = proxy.$clone(selectedBlock)
      //Get Block id to Update
      state.idBlock = proxy.$clone(selectedBlock.id)
      //Get data to pass to Form
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
          if (item.value == state.formBlock?.entity?.type) return item
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
            colClass: "col-12",
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
    //Save data
    async submitData() {
      const requestData = computeds.getBlockRequestData.value
      const keysNotToSnakeCase = [...(Object.keys(requestData.attributes) ?? []), "component", "entity", "attributes"]
      //Request params
      const requestParams = {notToSnakeCase: keysNotToSnakeCase}

      if(state.idBlock) {
        state.showModal = false;
        state.idBlock = null;
        emit('updated', requestData)
      } else await methods.createBlock(requestData, requestParams)
    },
    //Create Block
    async createBlock(data, params) {
      state.loading = true

      service.createBlock(data, params).then(response => {
        state.loading = false
        state.showModal = false;
        //Merge translations
        state.languageOptions.forEach(lang => {
          const locale = lang.value
          response[locale] = {
            ...data[locale],
          }
        })
        
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
