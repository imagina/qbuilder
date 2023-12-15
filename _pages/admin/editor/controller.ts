import {computed, onMounted, onUnmounted,reactive, ref, toRefs, watch, getCurrentInstance} from "vue";
import service from '@imagina/qbuilder/_pages/admin/editor/services'
import store from '@imagina/qbuilder/_pages/admin/editor/store'

export default function editorController() {
  const proxy = getCurrentInstance()!.proxy

  // Refs
  const refs = {
    refIframePost: ref(null)
  }

  // States
  const state = reactive({
    layoutTab: 'preview',
    loading: false
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
      const {layout, select} = value
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
        proxy.$alert.info({message: proxy.$tr('isite.cms.message.recordUpdated')})
        methods.saveBlocks(layout.blocks)
      }).catch(error => {
        proxy.$alert.error({message: proxy.$tr('isite.cms.message.recordNoUpdated')})
        state.loading = false
      })
    },
    saveBlocks(blocks) {
      const requestParams = {notToSnakeCase: ["component", "entity", "attributes"]}
      for (let i = 0; i < blocks.length; i++) {
        const block = blocks[i];

        proxy.$crud.update('apiRoutes.qbuilder.blocks', block.id, block, requestParams).then(response => {
          proxy.$alert.info({message: proxy.$tr('isite.cms.message.recordUpdated')});
          // Verificar si es el último ciclo
          if (i === blocks.length - 1) {
            state.loading = false;
          }
        }).catch(error => {
          proxy.$alert.error({message: proxy.$tr('isite.cms.message.recordNoUpdated')});
          // En caso de error, también considerarlo como el último ciclo
          if (i === blocks.length - 1) {
            state.loading = false;
          }
        });
      }

    },
  }

  // Mounted
  onMounted(() => {
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
