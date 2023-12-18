import {computed, onMounted, onUnmounted,reactive, ref, toRefs, watch, getCurrentInstance} from "vue";
import service from '@imagina/qbuilder/_pages/admin/editor/services'
import store from '@imagina/qbuilder/_pages/admin/editor/store'

export default function editorController() {
  const proxy = getCurrentInstance()!.proxy

  // Refs
  const refs = {
    refIframePost: ref(null),
    crudLayout: ref(null)
  }

  // States
  const state = reactive({
    layoutTab: 'preview',
    loading: false,
    layoutLoading: false,
    layouts: []
  })

  // Computed
  const computeds = {
    storeSelectedLayout: computed(() => store.layoutSelected),
    tabColor: computed(() => state.layoutTab == 'preview' ? 'purple' : 'orange'),
  }

  // Methods
  const methods = {
    previewPage() {
      if (state.layoutTab === 'preview' && refs.refIframePost) {
        setTimeout(() => {
          refs.refIframePost.value.loadIframe(
            `${proxy.$store.state.qsiteApp.baseUrl}/api/ibuilder/v1/layout/preview/${store.layoutSelected.id}`,
            store.layoutSelected
          )
        }, 300)
      }
    },
    changeLayout(value) {
      const {item: layout, select} = value
      if(store.layoutSelected && store.layoutSelected.id !== layout.id) {
        proxy.$alert.warning({
          mode: 'modal',
          title: proxy.$tr('ibuilder.cms.label.sureChangeLayout'),
          message: proxy.$tr('ibuilder.cms.label.descriptionSureChangeLayout'),
          actions: [
            {label: proxy.$tr('isite.cms.label.cancel'), color: 'grey-8'},
            {
              label: proxy.$tr('isite.cms.label.accept'),
              color: 'green',
              handler: () => {
                store.layoutSelected = layout
                select(layout)
              }
            },
          ]
        })
      } else {
        store.layoutSelected = layout
        select(layout)
      }
    },
    saveLayout() {
      state.loading = true
      const layout = store.layoutSelected

      proxy.$crud.update('apiRoutes.qbuilder.layouts', layout.id, layout).then(response => {
        methods.saveBlocks(layout.blocks)
      }).catch(error => {
        proxy.$alert.error({message: proxy.$tr('isite.cms.message.recordNoUpdated')})
        state.loading = false
      })
    },
    saveBlocks(blocks) {
      const requestParams = {notToSnakeCase: ["component", "entity", "attributes"]}
      const blockPromise = []
      for (let i = 0; i < blocks.length; i++) {
        const block = blocks[i];
        blockPromise.push(proxy.$crud.update('apiRoutes.qbuilder.blocks', block.id, block, requestParams))
      }

      Promise.all(blockPromise).then(() => {
        methods.getLayouts();
        proxy.$alert.info({message: proxy.$tr('isite.cms.message.recordUpdated')});
        state.loading = false;
      }).catch(error => {
        proxy.$alert.error({message: proxy.$tr('isite.cms.message.recordNoUpdated')});
        state.loading = false;
      });
    },
    getLayouts() {
      state.layoutLoading = true
      //Request
      service.getLayouts(true).then(response => {
        state.layouts = response.data
        state.layoutLoading = false
      }).catch(error => state.layoutLoading = false)
    },
  }

  // Mounted
  onMounted(() => {
    methods.getLayouts()
  })

  onUnmounted(() => {
    store.layoutSelected = null
  })

  // Watch
  watch(computeds.storeSelectedLayout, (newField, oldField) => {
    methods.previewPage();
  });

  watch(() => state.layoutTab, (newField, oldField) => {
    methods.previewPage();
  });

  return {...refs, ...(toRefs(state)), ...computeds, ...methods, store}
}
