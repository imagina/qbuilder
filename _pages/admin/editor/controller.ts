import Vue, {computed, onMounted, onUnmounted, reactive, ref, toRefs, watch, getCurrentInstance} from "vue";
import service from '@imagina/qbuilder/_pages/admin/editor/services'
import store from '@imagina/qbuilder/_pages/admin/editor/store'
import iframePost from "@imagina/qsite/_components/v3/iframePost/index.vue";
import layoutPanel from '@imagina/qbuilder/_components/layoutPanel/index.vue';
import handleGrid from '@imagina/qsite/_components/v3/handleGrid/index.vue';
import blockForm from '@imagina/qbuilder/_components/blockContentForm/index.vue'
import blockAttributesForm from '@imagina/qbuilder/_components/blockAttributesForm/index.vue';
import {Block, ModuleBlockConfig} from '@imagina/qbuilder/_components/blocksPanel/interface'

export default function editorController() {
  const proxy = (getCurrentInstance() as { proxy: Vue }).proxy as Vue

  // Refs
  const refs = {
    refIframePost: ref<InstanceType<typeof iframePost>>(),
    crudLayout: ref(null),
    refPanel: ref<InstanceType<typeof layoutPanel>>(),
    handleGrid: ref<InstanceType<typeof handleGrid>>(),
    refBlockForm: ref<InstanceType<typeof blockForm>>(),
    blockAttributesForm: ref<InstanceType<typeof blockAttributesForm>>(),
  }

  // States
  const state = reactive({
    blocks: [],
    layoutTab: 'preview',
    loading: false,
    showBlocksPanel: false,
    showBlockAttributesForm: false,
    infoBlock: {
      blockIndex: 0,
      layoutId: null
    },
    blockSelected: {}
  })

  // Computed
  const computeds = {
    storeSelectedLayout: computed(() => {
      //@ts-ignore
      state.blocks = store.layoutSelected?.blocks;
      return store.layoutSelected
    }),
    tabColor: computed(() => state.layoutTab == 'preview' ? 'purple' : 'orange'),
    titleTab: computed(() => store.layoutSelected?.title ?? proxy.$tr('ibuilder.cms.layout')),
    gridBlockActions: computed(() => {
      return {
        blockContent: {
          label: 'Contenido (PT)',
          icon: 'fa-regular fa-book',
          color: '',
          action: (data) => {
            refs.refBlockForm.value?.updateData(data)
          }
        },
        blockAttriutes: {
          label: 'Attibutes (PT)',
          icon: 'fa-regular fa-palette',
          color: '',
          action: (data) => {
            state.showBlockAttributesForm = true
            setTimeout(() => refs.blockAttributesForm?.value?.edit(data), 500)
          }
        }
      }
    })
  }

  // Methods
  const methods = {
    getData: async () => {
      state.loading = true
      await Promise.all([
        methods.getConfigBlocks()
      ])

      state.loading = false
    },
    previewPage() {
      if (state.layoutTab === 'preview') {
        setTimeout(() => {
          if (refs.refIframePost?.value?.loadIframe && store.layoutSelected)
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
      const blocks = state.blocks

      proxy.$crud.update('apiRoutes.qbuilder.layouts', layout.id, layout).then(response => {
        methods.saveBlocks(blocks)
      }).catch(error => {
        proxy.$alert.error({message: proxy.$tr('isite.cms.message.recordNoUpdated')})
        state.loading = false
      })
    },
    saveBlocks(blocks: any[]) {
      const blockPromise: Promise<any>[] = []
      for (let i = 0; i < blocks.length; i++) {
        const block = blocks[i];
        //Ignore snake_case
        const requestParams = {notToSnakeCase: [...(Object.keys(block.attributes) ?? []), "component", "entity", "attributes"]}
        blockPromise.push(proxy.$crud.update('apiRoutes.qbuilder.blocks', block.id, block, requestParams))
      }

      Promise.all(blockPromise).then(async () => {
        await refs.refPanel?.value?.refreshLayouts()
        state.loading = false;
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
      // Se cierra la ventana
      state.showBlocksPanel = false
      refs.handleGrid?.value?.updateSortOrder()
      //Wait the change load
      setTimeout(() => {
        methods.saveLayout();
      }, 100);
    },
    changeLayout(layout) {
      state.infoBlock.blockIndex = 0
      state.infoBlock.layoutId = layout.id
      refs.handleGrid?.value?.setState(layout.blocks)
    },
    openModalSelectBlock(val) {
      state.infoBlock.blockIndex = Number(val.index) + 1
      state.showBlocksPanel = true
    },
    setBlock(block: Block) {
      state.blockSelected = block
    },
    //Get all config Blocks
    getConfigBlocks: async () => {
      //Set the principal Block that exist in all blocks
      const principalBlock = 'x-ibuilder::block'

      const params = {
        filter: {allTranslations: true, configNameByModule: 'blocks'}
      }

      //Get configs
      const config = await service.getModuleBlocks(true, params)
      const response: ModuleBlockConfig[] = []
      //Filter only items with values
      Object.keys(config).forEach(moduleName => {
        if (config[moduleName]) {
          // Loop modules of config
          const modules = config[moduleName]
          for (const key in modules) {

            const module = modules[key]
            //Added blockConfig in all configs like child
            if (module.systemName !== principalBlock) {
              module.childBlocks = {
                mainblock: principalBlock,
                ...(module.childBlocks || {})
              }
            }

            //Save data of modules
            response.push(module)
          }
        }
      })
      store.blockConfigs = response
    },
    //Updated Info in HandleGrid
    updatedBlock(block) {
      refs.handleGrid?.value?.updateItem(block)
    },
  }

  // Mounted
  onMounted(() => {
    methods.getData()
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
