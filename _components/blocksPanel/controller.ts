import {computed, reactive, ref, onMounted, toRefs, watch, getCurrentInstance} from "vue";
import service from '@imagina/qbuilder/_components/blocksPanel/services'
import store from '@imagina/qbuilder/_components/blocksPanel/store'

export default function controller(props: any, emit: any) {
  const proxy = getCurrentInstance()!.proxy

  // Refs
  const refs = {
    // refKey: ref(defaultValue)
  }

  // States
  const state = reactive({
    loading: false,
    localBlocks: [],
    blockLibrary: [],
    blockTypeSelected: null,
    blockTypeConfig: [],
    blockSelected: {}
  })

  // Computed
  const computeds = {
    //Return the existing blocks to list
    blockTypes: computed(() => {
      // todo: obtener el name/title de cada bloque según el sistemName
      let blockTypes = new Set([...state.localBlocks, ...state.blockLibrary].map(item => item.component.systemName))
      const configs = state.blockTypeConfig
      blockTypes = Array.from(blockTypes)
      const response = []

      for (const config of configs) {
        if(blockTypes.includes(config.systemName)) {
          response.push({title: config.title, systemName: config.systemName})
        }
      }

      return response
    }),
    // return the blocks by selected type
    blocksBySelectedType: computed(() => {
      return {
        local: state.localBlocks.filter(block => block.component.systemName == state.blockTypeSelected),
        library: state.blockLibrary.filter(block => block.component.systemName == state.blockTypeSelected)
      }
    })
  }

  // Methods
  const methods = {
    getData: async () => {
      state.loading = true
      await Promise.all([
        methods.getLocalBlocks(),
        methods.getBlockLibrary(),
        methods.getConfigBlocks()
      ])
      state.loading = false
    },
    // Obtain the blocks from the same server
    getLocalBlocks: async () => {
      let blocks = await service.getLocalBlocks(true)
      state.localBlocks = blocks
    },
    // Obtain the blocks from the centralized server (library)
    getBlockLibrary: async () => {
      let blocks = await service.getBlockLibrary(true)
      state.blockLibrary = blocks
    },
    selectBlock(block, type = 'local') {
      state.blockSelected = {...block, blockType: type}
    },
    getConfigBlocks: async() => {
      const params = {
        filter: {allTranslations: true, configNameByModule: 'blocks'}
      }

      const config = await service.getModuleBlocks(true, params)
      const response = []
      //Filter only items with values
      Object.keys(config).forEach(moduleName => {
        if (config[moduleName]) {
          // Loop modules of config
          const modules = config[moduleName]
          for (const key in modules) {
            //Save data of modules
            response.push(modules[key])
          }
        }
      })
      state.blockTypeConfig = response
    }
  }

  // Mounted
  onMounted(() => {
    methods.getData()
  })

  // Watch
  // watch(key, (newField, oldField): void => {
  //
  // }, {deep: true})

  return {...refs, ...(toRefs(state)), ...computeds, ...methods, store}
}