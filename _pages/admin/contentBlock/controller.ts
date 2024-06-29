import Vue, {computed, onMounted, onUnmounted, reactive, ref, toRefs, watch, getCurrentInstance} from "vue";
import globalService from '@imagina/qbuilder/services'
import builderStore from '@imagina/qbuilder/store'
import {ModulesData, PropsDynamicField} from '@imagina/qbuilder/_components/blocksPanel/interface'

interface StateProps {
  idBlock: number | null,
  showModal: boolean,
  loading: boolean,
  contentFieldsBlock: any[],
}

export default function controller() {
  const proxy = (getCurrentInstance() as { proxy: Vue }).proxy as Vue

  // Refs
  const refs = {
    crudComponent: ref(null),
  }

  // States
  const state = reactive<StateProps>({
    showModal: false,
    idBlock: null,
    loading: false,
    contentFieldsBlock: []
  })

  // Computed
  const computeds = {
    // Validate the color by selectedTab
    crudData: computed(() => {
      return {
        update: {
          method: (item) => methods.openModal(item)
        },
      }
    }),
  }

  // Methods
  const methods = {
    async getDataTable(refresh = true) {
      methods.resetData();
      await refs.crudComponent.value.getDataTable(refresh);
    },
    openModal(item: any) {
      if (!builderStore.blockConfigs.length && !item) return

      state.idBlock = item.id;
      state.contentFieldsBlock = methods.getFormContentFields(item.component.systemName)
      state.showModal = true
    },
    //Get all config Blocks
    getConfigBlocks: async () => {
      state.loading = true

      //Instance the request params
      const requestParams = {filter: {allTranslations: true, configNameByModule: 'blocks'}}

      try {
        //Get configs
        const moduleConfigs = await globalService.getModuleBlocks(true, requestParams)
        globalService.getConfigBlocks(moduleConfigs)
      } catch (error) {
        proxy.$apiResponse.handleError(error, () => {
          console.error("[Ibuilder Get Configs]: ", error)
        })
      }

      state.loading = false
    },
    getFormContentFields(systemName: string) {
      const response = []
      const configs = builderStore.blockConfigs;
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
    addFakeFieldName(fields, name) {
      const tmpField = {};
      //Set fakeFieldName
      for (const [fieldName, field] of Object.entries(fields)) {
        tmpField[fieldName] = {
          ...field,
          ...(field?.type !== 'media' ? {fakeFieldName: name} : {fieldItemId: state.idBlock})
        }
      }

      return tmpField
    },
    resetData() {
      state.idBlock = null;
      state.showModal = false;
      state.contentFieldsBlock = []
    }
  }

  // Mounted
  onMounted(() => {
    methods.getConfigBlocks()
  })

  return {...refs, ...(toRefs(state)), ...computeds, ...methods}
}
