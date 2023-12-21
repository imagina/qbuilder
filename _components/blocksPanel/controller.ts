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
    blockTypeSelected: null
  })

  // Computed
  const computeds = {
    //Return the existing blocks to list 
    blockTypes: computed(() => {
      // todo: obtener el name/title de cda bloque según el sistemName
      let blockTypes = new Set([...state.localBlocks, ...state.blockLibrary].map(item => item.component.systemName))
      return Array.from(blockTypes)
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
        methods.getBlockLibrary()
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
