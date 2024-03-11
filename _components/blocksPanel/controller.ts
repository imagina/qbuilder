import Vue, {computed, reactive, ref, onMounted, toRefs, watch, getCurrentInstance} from "vue";
import service from '@imagina/qbuilder/_components/blocksPanel/services'
import store from '@imagina/qbuilder/_components/blocksPanel/store'
import storeEditor from '@imagina/qbuilder/_pages/admin/editor/store'
import blockForm from '@imagina/qbuilder/_components/blockContentForm/index.vue'
import {
  Block,
  ModuleBlockConfig
} from '@imagina/qbuilder/_components/blocksPanel/interface'

interface blockType {
  title: string
  systemName: string
}

interface StateProps {
  localBlocks: Block[],
  blockLibrary: Block[],
  blockTypeSelected: string | null,
  blockSelected: Block | null,
  blockTypeTab: string
  loading: Boolean,
}

export default function controller(props: any, emit: any) {
  const proxy = (getCurrentInstance() as { proxy: Vue }).proxy as Vue

  // Refs
  const refs = {
    refBlockForm: ref<InstanceType<typeof blockForm>>()
  }

  // States
  const state = reactive<StateProps>({
    localBlocks: [],
    blockLibrary: [],
    blockTypeSelected: null,
    blockSelected: null,
    blockTypeTab: 'global',
    loading: false
  })

  // Computed
  const computeds = {
    //Return the existing blocks to list
    blockTypes: computed(() => {
      const configs: ModuleBlockConfig[] = storeEditor.blockConfigs
        .filter(config => !config.internal)

      return configs
    }),
    // return the blocks by selected type
    blocksBySelectedType: computed(() => {
      return {
        local: state.localBlocks.filter(block => block.component.systemName == state.blockTypeSelected),
        library: state.blockLibrary.filter(block => block.component.systemName == state.blockTypeSelected)
      }
    }),
    tabColor: computed(() => state.blockTypeTab == 'global' ? 'purple' : 'orange'),
    //Return data of component by default
    blockDefault: computed(() => {
      if (!state.blockTypeSelected) return {}

      const blockSelected = storeEditor.blockConfigs.find(config => config.systemName === state.blockTypeSelected)

      if(!blockSelected) return {}

      return {
        component: {
          nameSpace: blockSelected.nameSpace,
          systemName: state.blockTypeSelected
        },
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
      refs.refBlockForm?.value?.fillData(block, props)
    },
    // Related a block with a layout
    relateBlock(block) {
      state.loading = true
      //instance the data to create layoutBlock
      const layoutBlockData = {
        layoutId : props.layoutId,
        blockId: block.id,
        sortOrder: props.index,
        parentSystemName: props.parentSystemName,
        gridPosition: 'col-12'
      }
      //Request
      service.createLayoutBlock(layoutBlockData).then(response => {
        state.loading = false
        block.pivot = {
          id: response.id,
          ...layoutBlockData
        };
        console.warn("Block Panel 117",block)
        methods.emitCreated({...block})
      }).catch(error => state.loading = false)
    },
    // Emit event when the block is created
    emitCreated(block) {
      state.blockSelected = null
      emit('created', block);
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
