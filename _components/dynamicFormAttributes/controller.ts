import {computed, reactive, onMounted, toRefs, watch} from "vue";
import service from 'src/modules/qbuilder/services'
import {Block} from 'src/modules/qbuilder/_components/blocksPanel/interface'
import store from "src/modules/qbuilder/store"
import {i18n, clone, alert} from 'src/plugins/utils'
import apiResponse from 'src/modules/qcrud/_plugins/apiResponse'

interface StateProps {
  block: Block,
  formBlock: any,
  loading: boolean,
  show: boolean,
  fields: any[]
}

export default function controller(props: any, emit: any) {

  // Refs
  const refs = {}

  // States
  const state = reactive<StateProps>({
    block: {} as Block,
    show: false,
    formBlock: {},
    loading: false,
    fields: []
  })

  // Computed
  const computeds = {
    modalProps: computed(() => {
      //Validate params props
      if (!state.show) return {}

      //Response
      return {
        title: (!props.idBlock) ? props.title : `${props.title} - ID: ${props.idBlock}`,
        width: 'max-content',
        loading: state.loading,
        actions: [
          {
            props: {
              color: 'green',
              label: (!props.idBlock) ? i18n.tr('isite.cms.label.save') : i18n.tr('isite.cms.label.update')
            },
            action: () => methods.updateBlock()
          }
        ]
      }
    })
  }

  // Methods
  const methods = {
    init() {
      if (store.blockConfigs.length) {
        methods.getData()
      }
    },
    getConfigBlocks: async () => {
      state.loading = true

      //Instance the request params
      const requestParams = {filter: {allTranslations: true, configNameByModule: 'blocks'}}

      try {
        //Get configs
        const moduleConfigs = await service.getModuleBlocks(true, requestParams)
        service.getConfigBlocks(moduleConfigs)
      } catch (error) {
        apiResponse.handleError(error, () => {
          console.error("[Ibuilder Get Configs]: ", error)
        })
      }

      state.loading = false
    },
    async getData() {
      if (props.idBlock && state.show) {
        state.loading = true
        try {
          //Get configs
          const block = await service.getOneBlock(true, props.idBlock)
          state.block = clone(block)
          state.formBlock = clone(block)
          state.fields = methods.getFormContentFields(block.component?.systemName)
        } catch (error) {
          apiResponse.handleError(error, () => {
            console.error("[Ibuilder Get Data]: ", error)
          })
        }

        state.loading = false
      }
    },
    //Update block
    updateBlock: () => {
      if (state.block) {
        state.loading = true
        const block = {
          ...state.block,
          ...state.formBlock
        }

        //Update block with editor service
        service.updateBlock(block.id, block).then(response => {
          alert.info({message: i18n.tr('isite.cms.message.recordUpdated')});
          //Emit info to Editor and Close Modal
          emit('update')
          methods.closeModal()
        }).catch(() => {
          alert.error({message: i18n.tr('isite.cms.message.recordNoUpdated')});
          state.loading = false
        })
      }
    },
    closeModal() {
      state.show = false
      state.block = {} as Block;
      state.formBlock = {};
      state.loading = false;
      state.fields = []
    },
    getFormContentFields(systemName: string) {
      const response: any[] = []
      const configs = store.blockConfigs;
      const principal = configs.find(c => c.systemName == systemName);

      if (principal) {
        if (principal.contentFields) {
          const fields = methods.addFakeFieldName(principal.contentFields, 'componentAttributes')
          response.push({name: principal.systemName, title: principal.title, fields})
        }

        Object.entries(principal.childBlocks).forEach(child => {
          const [name, systemName] = child
          const block = configs.find(c => c.systemName == systemName)

          if (block && block?.contentFields) {
            const fields = methods.addFakeFieldName(block.contentFields, name)
            response.push({name: block.systemName, title: block.title, fields})
          }
        })
      }
      return response;
    },
    addFakeFieldName(fields: any, name: string) {
      const tmpField = {};
      //Set fakeFieldName
      for (const [fieldName, field] of Object.entries(fields)) {

        tmpField[fieldName] = {
          //@ts-ignore
          ...field,
          // @ts-ignore
          ...(field?.type !== 'media' ? {fakeFieldName: name} : {fieldItemId: props.idBlock})
        }
      }

      return tmpField
    },
  }

  // Mounted
  onMounted(() => {
    methods.getConfigBlocks()
  })

  watch(() => props.modelValue, (newValue) => {
    state.show = clone(newValue);
    methods.init()
  })

  watch(() => state.show, (newValue) => {
    emit('update:modelValue', newValue)
  })

  watch(() => store.blockConfigs, (newValue) => {
    methods.init();
  })

  return {...refs, ...(toRefs(state)), ...computeds, ...methods}
}
