import store from '@imagina/qbuilder/_components/layoutPanel/store'
import service from '@imagina/qbuilder/_components/layoutPanel/service'
import {computed, reactive, ref, onMounted} from "vue";


export default function layoutController(props: any, emit: any) {
  const state = reactive({
    loading: false,
    layoutSelected: null
  })

  let model = {
    layouts: computed(() => store.layouts),
    loading: computed({
      get: () => state.loading,
      set: (val) => state.loading = val
    }),
    layoutSelected: computed({
      get: () => state.layoutSelected,
      set: (val) => state.layoutSelected = val
    })
  }

  const methods = {
    init() {
      this.getLayouts()
    },
    getLayouts() {
      state.loading = true
      //Request
      service.getLayouts(true).then(response => {
        store.layouts = response.data;
        state.loading = false
      }).catch(error => state.loading = false)
    },
    setLayoutSelected(layout) {
      state.layoutSelected = layout
      emit('selected', layout)
    }
  }

  //mounted
  onMounted(() => {
    methods.init()
  })

  return {...model, ...methods}
}
