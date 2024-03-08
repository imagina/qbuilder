import Vue, {computed, reactive, ref, onMounted, toRefs, getCurrentInstance, watch, onUnmounted} from "vue";
import service from "@imagina/qbuilder/_components/blocksPanel/services";
import store from "@imagina/qbuilder/_pages/admin/editor/store";
import recursiveStore from "@imagina/qsite/_components/v3/recursiveItem/store";
import {Block, ModuleBlockConfig} from '@imagina/qbuilder/_components/blocksPanel/interface'

//Map the object as needed by the recursiveItem
interface MapBlock {
  label: string,
  action?: () => void,
  children: MapBlockChildren[],
  headerClass?: string,
  customClass?: string
}

interface MapBlockChildren {
  id: number,
  type?: string,
  label: string,
  activated: Boolean,
  subLabel?: string,
  action?: (value: MapBlockChildren) => Promise<Boolean>,
  icon: string
}

//State Props Interface
interface StateProps {
  blocks: Block[],
  mapBlocks: MapBlock[]
  loading: Boolean,
}

export default function layoutController(props: any, emit: any) {
  const proxy = (getCurrentInstance() as { proxy: Vue }).proxy as Vue
  // Refs
  const refs = {
    // key: ref(defaultValue)
  }

  // States
  const state = reactive<StateProps>({
    blocks: [],
    mapBlocks: [],
    loading: false
  })

  // Computed
  const computeds = {}

  // Methods
  const methods = {
    //Return the existing blocks to list
    blockTypes: () => {
      const configs: ModuleBlockConfig[] = store.blockConfigs
        .filter(config => !config.internal)

      return configs
    },
    //Get Blocks
    getBlocks(): Promise<boolean> {
      state.loading = true
      return new Promise(resolve => {
        //Request
        service.getLocalBlocks(true).then(response => {
          state.blocks = response
          //Every time the service is called, the blocks will be remapped
          state.mapBlocks = methods.orderedItems()
          state.loading = false
          resolve(false)
        }).catch(error => {
          state.loading = false
          resolve(false)
        })
      })
    },
    //Refresh blocks petition
    async refreshBlocks(crudAction = '') {
      emit('refresh', true)
      //Update blocks
      await methods.getBlocks();

      let blockSelected: any = null

      //If the action is create, assign the first block to the editor and recursiveItem stores
      if (crudAction == 'blockCreated') {
        const firstBlock: any = state.blocks.reduce(function(beforeBlock, currentBlock) {
          return beforeBlock.id > currentBlock.id ? beforeBlock : currentBlock;
        });
        recursiveStore.itemSelected = firstBlock;
        blockSelected = firstBlock;
      } else if (store.viewBlockSelected && store.viewBlockSelected.id) {
        blockSelected = state.blocks.find(block => block.id === store.viewBlockSelected?.id) || null
      }

      if(blockSelected) {
        store.viewBlockSelected = proxy.$clone(blockSelected);
        emit('selected', proxy.$clone(blockSelected));
      }

      emit('refresh', false)
    },
    //Order the Blocks to send to recursiveItem
    orderedItems() {
      const blockConfigs = methods.blockTypes()
      const response: MapBlock[] = [];

      // loop each module block config
      blockConfigs.forEach(config => {

        // Get block Filtered
        const blockFiltered = state.blocks.filter(block => {
          return block.component.systemName == config.systemName
        })
        // Map the Blocks
        const blockFilteredChildren: MapBlockChildren[] = blockFiltered.map(block => ({
          ...block,
          label: `${block.id} ${block.internalTitle}`,
          subLabel: block.systemName,
          activated: true,
          icon: 'fa-light fa-arrow-right',
          action: methods.selectBlock
        }))

        // Include to response by systemName
        response.push({
          label: `${config.title}`,
          headerClass: 'expansion-header',
          customClass: 'expansion-border',
          children: blockFilteredChildren.sort((a, b) => b.id - a.id)
        })
      })

      // Response
      return response
    },
    //Define the action that will have coda children in recursiveItem
    selectBlock(blockSelected: MapBlockChildren) {
      // internal method to select the Block
      const block = state.blocks.find(i => i.id === blockSelected.id)
      if (!block) return Promise.resolve(true)
      store.viewBlockSelected = proxy.$clone(block)
      emit('selected', proxy.$clone(block));

      return Promise.resolve(true)
    },
  }

  // Mounted
  onMounted(() => {
    methods.getBlocks()
  })

  return {...refs, ...(toRefs(state)), ...computeds, ...methods}
}
