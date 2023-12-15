import {computed, reactive, ref, onMounted, toRefs, getCurrentInstance} from "vue";
import service from '@imagina/qbuilder/_components/layoutPanel/service'
import store from '@imagina/qbuilder/_components/layoutPanel/store'

export default function layoutController(props: any, emit: any) {
  const proxy = getCurrentInstance()!.proxy
  // Refs
  const refs = {
    // key: ref(defaultValue)
  }

  // States
  const state = reactive({
    loading: false,
    layouts: [],
    layoutSelected: null
  })

  // Computed
  const computeds = {
    // key: computed(() => {})
  }

  // Methods
  const methods = {
    getLayouts() {
      state.loading = true
      //Request
      service.getLayouts(true).then(response => {
        state.layouts = response.data
        state.loading = false
      }).catch(error => state.loading = false)
    },
    setLayoutSelected(layoutSelected) {
      const layout = proxy.$clone(layoutSelected)
      emit('selected', {layout, select: (val) => {state.layoutSelected = val}})
    }
  }

  // Mounted
  onMounted(() => {
    methods.getLayouts()
  })

  return {...refs, ...(toRefs(state)), ...computeds, ...methods, store}
}
