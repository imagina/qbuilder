import store from '@imagina/qbuilder/_pages/admin/editor/store'
import {computed, onMounted, reactive} from "vue";


export default function editorController() {

  const state = reactive({
    layoutTab: 'preview'
  })

  const model = {
    panelWidth: computed(() => store.panelWidth),
    layoutSelected: computed({
      get: () => store.layoutSelected,
      set: (val) => store.layoutSelected = val
    }),
    layoutTab: computed({
      get: () => state.layoutTab,
      set: (val) => state.layoutTab = val,
    }),
    tabColor: computed(() => state.layoutTab == 'preview' ? 'purple' : 'orange')
  }

  const methods = {}

  onMounted(() => {
  })

  return {...model, ...methods}
}
