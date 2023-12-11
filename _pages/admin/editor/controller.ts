import {computed, onMounted, reactive, ref, toRefs, watch, getCurrentInstance} from "vue";
import service from '@imagina/qbuilder/_pages/admin/editor/services'
import store from '@imagina/qbuilder/_pages/admin/editor/store'

export default function editorController() {
  const proxy = getCurrentInstance().proxy

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
    storeSelectedLayout: computed(() => store.layoutSelected),
    tabColor: computed(() => state.layoutTab == 'preview' ? 'purple' : 'orange'),
  }

  // Methods
  const methods = {
    previewPage() {
      setTimeout(() => {
        refs.refIframePost.value.loadIframe(
            `${proxy.$store.state.qsiteApp.baseUrl}/api/ibuilder/v1/layout/preview/${store.layoutSelected.id}`,
            store.layoutSelected
        )
      }, 300)
    }
  }

  // Mounted
  onMounted(() => {
  })

  // Watch
  watch(computeds.storeSelectedLayout, (newField, oldField) => {
    methods.previewPage();
  });

  watch(() => state.layoutTab, (newField, oldField) => {
    if(state.layoutTab === 'preview') {
      methods.previewPage();
    }
  });

  return {...refs, ...(toRefs(state)), ...computeds, ...methods, store}
}
