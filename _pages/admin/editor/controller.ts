import {computed, onMounted, reactive, ref, toRefs} from "vue";
import service from '@imagina/qbuilder/_pages/admin/editor/services'
import store from '@imagina/qbuilder/_pages/admin/editor/store'


export default function editorController() {
  // Refs
  const refs = {
    refIframePost: ref(null)
  }

  // States
  const state = reactive({
    layoutTab: 'preview'
  })

  // Computed
  const computeds = {
    tabColor: computed(() => state.layoutTab == 'preview' ? 'purple' : 'orange')
  }

  // Methods
  const methods = {}

  // Mounted
  onMounted(() => {
  })

  return {...refs, ...(toRefs(state)), ...computeds, ...methods, store}
}
