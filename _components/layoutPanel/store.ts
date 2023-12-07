import {computed, reactive} from "vue";
import {Layout} from '@imagina/qbuilder/_components/layoutPanel/interface'

interface State {
  layouts: Layout[]
}

const state = reactive<State>({
  layouts: []
})

export default computed(() => ({
  set layouts(val) {
    state.layouts = val
  },
  get layouts() {
    return state.layouts
  }
})).value
