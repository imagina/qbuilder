import Vue, {reactive, computed} from 'vue';
import crud from '@imagina/qcrud/_services/baseService';
import helper from '@imagina/qsite/_plugins/helper'
import { Layout } from '@imagina/qbuilder/_components/layoutPanel/interface'
import { Block, ModuleBlockConfig } from '@imagina/qbuilder/_components/blocksPanel/interface'

interface StateProps {
  panelWidth: string,
  layoutSelected: Layout | null
  blockSelected: Block | null
  blockConfigs: ModuleBlockConfig[]
}
//States
const state = reactive<StateProps>({
  panelWidth: '380px',
  layoutSelected: null,
  blockSelected: null,
  blockConfigs: []
})

export default computed(() => ({
  get panelWidth() {
    return state.panelWidth
  },
  get layoutSelected() {
    return state.layoutSelected
  },
  set layoutSelected(val) {
    state.layoutSelected = val
  },
  get blockSelected() {
    return state.blockSelected
  },
  set blockSelected(val) {
    state.blockSelected = val
  },
  get blockConfigs() {
    return state.blockConfigs
  },
  set blockConfigs(val) {
    state.blockConfigs = val
  }

})).value
