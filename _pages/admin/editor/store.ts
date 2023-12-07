import Vue, {reactive, computed} from 'vue';
import crud from '@imagina/qcrud/_services/baseService';
import helper from '@imagina/qsite/_plugins/helper'

//States
const state = reactive({
  panelWidth: '380px',
  layoutSelected: null
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
  }
})).value
