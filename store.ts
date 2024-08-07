import {reactive, computed} from 'vue'
import {ModuleBlockConfig} from './_components/blocksPanel/interface'

interface StateProps {
  blockConfigs: ModuleBlockConfig[],
  mainBlockSystemName: string
}

//States
const state = reactive<StateProps>({
  blockConfigs: [],
  mainBlockSystemName: 'x-ibuilder::block'
})

export default computed(() => ({
  get blockConfigs() {
    return state.blockConfigs
  },
  set blockConfigs(val) {
    state.blockConfigs = val
  },
  get mainBlockSystemName() {
    return state.mainBlockSystemName
  },
  get ignoreConfigKeys() {
    const childKeysConfig = new Set(state.blockConfigs.reduce((acc, current) => {
      return [...Object.keys(current.childBlocks ?? {}), ...acc]
    }, ["componentAttributes"]))

    return Array.from(childKeysConfig)
  }
})).value
