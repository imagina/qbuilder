import {computed, reactive} from "vue";
//import {StateKeyInterface} from '@imagina/qbuilder/_components/blocksPanel/interface'

interface StateInterface {
  //stateKey: StateKeyInterface[]
}

const state = reactive<StateInterface>({
  // key: Default value
})

export default computed(() => ({
  // set key(val) {
  //   state.key = val
  // },
  // get key() {
  //   return state.key
  // }
})).value
