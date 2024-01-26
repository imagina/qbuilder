import Vue, {computed, reactive, ref, onMounted, toRefs, watch, getCurrentInstance} from "vue";
import store from '@imagina/qbuilder/_components/blockAttributesForm/store'
import storeEditor from '@imagina/qbuilder/_pages/admin/editor/store'
import {
  Block,
  ModuleBlockConfig
} from '@imagina/qbuilder/_components/blocksPanel/interface'
import iframePost from "@imagina/qsite/_components/v3/iframePost/index.vue";
import {debounce} from 'quasar'

interface StateProps {
  block: Block,
  blockDataForm: Block,
  selectedComponentName: string
  tabName: 'attributes'
}

export default function controller(props: any, emit: any) {
  const proxy = (getCurrentInstance() as { proxy: Vue }).proxy as Vue

  // Refs
  const refs = {
    refIframePost: ref<InstanceType<typeof iframePost>>(),
  }

  // States
  const state = reactive<StateProps>({
    block: {} as Block,
    blockDataForm: {
      attributes: {}
    } as Block,
    selectedComponentName: 'x-ibuilder::block',
    tabName: 'attributes'
  })

  // Computed
  const computeds = {
    //Returns the color of tabs
    tabColor: computed(() => state.tabName == 'attributes' ? 'purple' : 'orange'),
    // returns the block config from state.block
    blockConfig: computed<ModuleBlockConfig | null | undefined>(() => {
      if (!state.block.id) return null
      return storeEditor.blockConfigs.find(config => {
        return config.systemName == state.block.component?.systemName
      })
    }),
    // Returns the block configs of the block and its child blocks
    componentsConfig: computed<ModuleBlockConfig[]>(() => {
      if (!computeds.blockConfig.value) return []
      const childBlocksSystemName = Object.values(computeds.blockConfig.value.childBlocks || {})
      return [
        computeds.blockConfig.value,
        ...storeEditor.blockConfigs.filter(config => {
          return childBlocksSystemName.includes(config.systemName)
        })
      ]
    }),
    //Return the config of selected component
    selectedComponent: computed(() => {
      return computeds.componentsConfig.value.find(comp => comp.systemName == state.selectedComponentName)
    }),
    //Return the config of dynamic-form to attributes
    attributesForm: computed(() => {
      if (!computeds.selectedComponent.value) return []
      return Object.values(computeds.selectedComponent.value.attributes)
    }),
    //Return the config of dynamic-form to attributes
    contentForm: computed(() => {
      if (!computeds.selectedComponent.value) return []
      return [
        {
          name : 'maincontent',
          title: 'Contenido (PT)',
          fields: computeds.selectedComponent.value.contentFields || {}
        }
      ]
    })
  }

  // Methods
  const methods = {
    edit: (block) => {
      state.block = block
      //Set block data
      state.blockDataForm = proxy.$clone(block)
    },
    previewBlock() {
      setTimeout(() => {
        if (refs.refIframePost?.value?.loadIframe && state.block.id)
          refs.refIframePost.value.loadIframe(
            `${proxy.$store.state.qsiteApp.baseUrl}/api/ibuilder/v1/block/preview`,
            state.block
          )
      }, 300)
    },
    //Get name of the block in Attributes
    getComponentName(systemName) {
      const block = computeds.blockConfig.value?.childBlocks ?? {};
      return Object.keys(block).find(key => block[key] === systemName);
    },
    mergeDataForm: debounce((data) => {
      const nameOfAttribute = methods.getComponentName(state.selectedComponentName);

      if(nameOfAttribute) {
        state.block = {
          ...state.block,
          attributes: {
            ...state.block.attributes,
            [nameOfAttribute]: data
          }
        }
      }
    }, 500)
  }

  // Mounted
  onMounted(() => {
  })

  // Watch
  watch(() => state.block, (newField, oldField) => {
    methods.previewBlock();
  });

  return {...refs, ...(toRefs(state)), ...computeds, ...methods, store}
}
