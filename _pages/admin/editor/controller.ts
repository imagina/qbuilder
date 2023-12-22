import {computed, onMounted, onUnmounted, reactive, ref, toRefs, watch, getCurrentInstance} from "vue";
import service from '@imagina/qbuilder/_pages/admin/editor/services'
import store from '@imagina/qbuilder/_pages/admin/editor/store'
import iframePost from "@imagina/qsite/_components/v3/iframePost/index.vue";

export default function editorController() {
  const proxy = getCurrentInstance()!.proxy

  // Refs
  const refs = {
    refIframePost: ref<InstanceType<typeof iframePost>>(),
    crudLayout: ref(null),
    refPanel: ref(null),
    handleGrid: ref(null)
  }

  // States
  const state = reactive({
    layoutTab: 'preview',
    loading: false,
    showBlocksPanel: false
  })

  // Computed
  const computeds = {
    storeSelectedLayout: computed(() => store.layoutSelected),
    tabColor: computed(() => state.layoutTab == 'preview' ? 'purple' : 'orange'),
    titleTab: computed(() => store.layoutSelected?.title ?? proxy.$tr('ibuilder.cms.layout'))
  }

  // Methods
  const methods = {
    previewPage() {
      if (state.layoutTab === 'preview' && refs.refIframePost) {
        setTimeout(() => {
          //@ts-ignore
          refs.refIframePost?.value?.loadIframe(
              //@ts-ignore
              `${proxy.$store.state.qsiteApp.baseUrl}/api/ibuilder/v1/layout/preview/${store.layoutSelected.id}`,
              store.layoutSelected
          )
        }, 300)
      }
    },
    saveLayout() {
      state.loading = true
      const layout = store.layoutSelected

      //@ts-ignore
      proxy.$crud.update('apiRoutes.qbuilder.layouts', layout.id, layout).then(response => {
        //@ts-ignore
        methods.saveBlocks(layout.blocks)
      }).catch(error => {
        proxy.$alert.error({message: proxy.$tr('isite.cms.message.recordNoUpdated')})
        state.loading = false
      })
    },
    saveBlocks(blocks: any[]) {
      const requestParams = {notToSnakeCase: ["component", "entity", "attributes"]}
      const blockPromise = []
      for (let i = 0; i < blocks.length; i++) {
        const block = blocks[i];
        //@ts-ignore
        blockPromise.push(proxy.$crud.update('apiRoutes.qbuilder.blocks', block.id, block, requestParams))
      }

      Promise.all(blockPromise).then(() => {
        refs.refPanel.value.getLayouts();
        proxy.$alert.info({message: proxy.$tr('isite.cms.message.recordUpdated')});
        state.loading = false;
      }).catch(error => {
        proxy.$alert.error({message: proxy.$tr('isite.cms.message.recordNoUpdated')});
        state.loading = false;
      });
    },
    refreshLayouts(crudAction) {
      refs.refPanel?.value.getLayouts(crudAction);
    },
    createBlock(val) {
      const {onCreate} = val
      proxy.$alert.warning({
        mode: 'modal',
        title: "Crea un nuevo Bloque",
        message: "Crea un bloque de prueba ya",
        actions: [
          {label: proxy.$tr('isite.cms.label.cancel'), color: 'grey-8'},
          {
            label: proxy.$tr('isite.cms.label.accept'),
            color: 'green',
            handler: () => {
              onCreate({id: state.id, sortOrder: 1, gridPosition: 'col-md-12', internalTitle: 'Test'})
              state.id += 1
              console.log('Creando...')
            }
          },
        ]
      })
    },
    changeLayout(layout) {
      refs.handleGrid?.value?.setState(layout.blocks)
    }
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
