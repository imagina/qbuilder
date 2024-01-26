import {computed, reactive, ref, onMounted, toRefs, watch, getCurrentInstance} from "vue";
import store from '@imagina/qbuilder/_components/blockAttributesForm/store'
import storeEditor from '@imagina/qbuilder/_pages/admin/editor/store'
import {Block} from "@imagina/qbuilder/_components/blocksPanel/interface";
import {
  Block,
  ModuleBlockConfig
} from '@imagina/qbuilder/_components/blocksPanel/interface'

interface StateProps {
  block: Block,
  selectedComponentName: string
  tabName: 'attributes'
}

export default function controller(props: any, emit: any) {
  const proxy = getCurrentInstance()!.proxy

  // Refs
  const refs = {
    // refKey: ref(defaultValue)
  }

  // States
  const state = reactive<StateProps>({
    block: null,
    selectedComponentName: 'x-ibuilder::block',
    tabName: 'attributes'
  })

  // Computed
  const computeds = {
    //Returns the color of tabs
    tabColor: computed(() => state.tabName == 'attributes' ? 'purple' : 'orange'),
    // returns the block config from state.block
    blockConfig: computed<ModuleBlockConfig>(() => {
      if (!state.block) return null
      return storeEditor.blockConfigs.find(config => {
        return config.systemName == state.block.component.systemName
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
    }
  }

  // Mounted
  onMounted(() => {
  })

  // Watch
  // watch(key, (newField, oldField): void => {
  //
  // }, {deep: true})

  return {...refs, ...(toRefs(state)), ...computeds, ...methods, store}
}
