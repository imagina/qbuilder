import {computed, reactive, ref, onMounted, toRefs, watch, getCurrentInstance} from "vue";
import service from '@imagina/qbuilder/_components/blocksPanel/services'
import store from '@imagina/qbuilder/_components/blocksPanel/store'
import storeEditor from '@imagina/qbuilder/_pages/admin/editor/store'
import {
  Block,
  ModuleBlockConfig
} from '@imagina/qbuilder/_components/blocksPanel/interface'

interface blockType {
  title: string
  systemName: string
}

export default function controller(props: any, emit: any) {
  const proxy = getCurrentInstance()!.proxy

  // Refs
  const refs = {
    refBlockForm: ref(null)
  }

  interface StateProps {
    loading: Boolean,
    localBlocks: Block[],
    blockLibrary: Block[],
    blockTypeSelected: string | null,
    blockSelected: Block | null,
    blockTypeTab: string
  }

  // States
  const state = reactive<StateProps>({
    loading: false,
    localBlocks: [],
    blockLibrary: [],
    blockTypeSelected: null,
    blockSelected: null,
    blockTypeTab: 'global'
  })

  // Computed
  const computeds = {
    //Return the existing blocks to list
    blockTypes: computed(() => {
      // todo: obtener el name/title de cada bloque según el sistemName
      const setBlockTypes: Set<string> = new Set([...state.localBlocks, ...state.blockLibrary].map(item => item.component.systemName))

      const configs: ModuleBlockConfig[] = storeEditor.blockConfigs
      const blockTypes: string[] = Array.from(setBlockTypes)
      const response: blockType[] = []

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
    }),
    tabColor: computed(() => state.blockTypeTab == 'global' ? 'purple' : 'orange')
  }

  // Methods
  const methods = {
    getData: async () => {
      state.loading = true
      await Promise.all([
        methods.getLocalBlocks(),
        methods.getBlockLibrary()
      ])
      //Set the default block type
      state.blockTypeSelected = computeds.blockTypes.value[0].systemName
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
    selectBlock(block) {
      state.blockSelected = block
      refs.refBlockForm.value.fillBlockData(block, 1)
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
