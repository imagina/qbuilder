import {computed, onMounted, onUnmounted, reactive, ref, toRefs, watch, getCurrentInstance} from "vue";
import service from '@imagina/qbuilder/_pages/admin/editor/services'
import store from '@imagina/qbuilder/_pages/admin/editor/store'
import iframePost from "@imagina/qsite/_components/v3/iframePost/index.vue";
import layoutPanel from '@imagina/qbuilder/_components/layoutPanel/index.vue';
import handleGrid from '@imagina/qsite/_components/v3/handleGrid/index.vue';

export default function editorController() {
  const proxy = getCurrentInstance()!.proxy

  // Refs
  const refs = {
    refIframePost: ref<InstanceType<typeof iframePost>>(),
    crudLayout: ref(null),
    refPanel: ref<InstanceType<typeof layoutPanel>>(),
    handleGrid: ref<InstanceType<typeof handleGrid>>()
  }

  // States
  const state = reactive({
    layoutTab: 'preview',
    loading: false,
    showBlocksPanel: false,
    blockIndex: -1
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
      if (state.layoutTab === 'preview') {
        setTimeout(() => {
          if(refs.refIframePost?.value?.loadIframe && store.layoutSelected)
            refs.refIframePost.value.loadIframe(
                `${proxy.$store.state.qsiteApp.baseUrl}/api/ibuilder/v1/layout/preview/${store.layoutSelected.id}`,
                store.layoutSelected
            )
        }, 300)
      }
    },
    saveLayout() {
      state.loading = true
      const layout = store.layoutSelected!

      proxy.$crud.update('apiRoutes.qbuilder.layouts', layout.id, layout).then(response => {
        methods.saveBlocks(layout.blocks)
      }).catch(error => {
        proxy.$alert.error({message: proxy.$tr('isite.cms.message.recordNoUpdated')})
        state.loading = false
      })
    },
    saveBlocks(blocks: any[]) {
      const requestParams = {notToSnakeCase: ["component", "entity", "attributes"]}
      const blockPromise: Promise<any>[] = []
      for (let i = 0; i < blocks.length; i++) {
        const block = blocks[i];
        blockPromise.push(proxy.$crud.update('apiRoutes.qbuilder.blocks', block.id, block, requestParams))
      }

      Promise.all(blockPromise).then(async () => {
        state.loading = await refs.refPanel?.value?.getLayouts() || false;
        proxy.$alert.info({message: proxy.$tr('isite.cms.message.recordUpdated')});
      }).catch(error => {
        proxy.$alert.error({message: proxy.$tr('isite.cms.message.recordNoUpdated')});
        state.loading = false;
      });
    },
    async refreshLayouts(crudAction) {
      state.loading = true
      state.loading = await refs.refPanel?.value?.getLayouts(crudAction) || false;
    },
    createBlock(block) {
      //Se crea el nuevo bloque
      refs.handleGrid?.value?.onCreate(state.blockIndex ,block)
      // Se cierra la ventana
      state.showBlocksPanel = false
    },
    changeLayout(layout) {
      state.blockIndex = -1
      refs.handleGrid?.value?.setState(layout.blocks)
    },
    openModalSelectBlock(val) {
      state.blockIndex = val.index
      state.showBlocksPanel = true
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
