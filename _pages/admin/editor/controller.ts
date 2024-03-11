import Vue, {computed, onMounted, onUnmounted, reactive, ref, toRefs, watch, getCurrentInstance} from "vue";
import service from '@imagina/qbuilder/_pages/admin/editor/services'
import store from '@imagina/qbuilder/_pages/admin/editor/store'
import iframePost from "@imagina/qsite/_components/v3/iframePost/index.vue";
import layoutList from '@imagina/qbuilder/_components/layoutList/index.vue';
import blockList from '@imagina/qbuilder/_components/blockList/index.vue';
import handleGrid from '@imagina/qsite/_components/v3/handleGrid/index.vue';
import blockForm from '@imagina/qbuilder/_components/blockContentForm/index.vue'
import blockAttributesForm from '@imagina/qbuilder/_components/blockAttributesForm/index.vue';
import {Block, ModuleBlockConfig} from '@imagina/qbuilder/_components/blocksPanel/interface'
import {Layout} from '@imagina/qbuilder/_components/layoutList/interface'

interface PropInfoToCreateBlock
{
  index: number,
  layoutId: number | null,
  parentSystemName: string | null,
  view: 'layout' | 'block'
}

interface StateProps
{
  blocks: Block[];
  layoutTab: 'builder' | 'preview',
  layoutClone: Layout | null,
  loading: boolean,
  showBlocksPanel: boolean,
  showLayoutPanel: boolean,
  showBlockAttributesForm: boolean,
  infoToCreateBlock: PropInfoToCreateBlock,
  gridBlocks: Block[]
  view: 'layout' | 'block'
}

interface PropsHandleChangesBlock
{
  block: null | Block,
  wasDeleted: boolean,
  refresh: boolean,
  update?: boolean
  persistModalAttributes?: boolean
  crudAction?: string
  cancel?: boolean
}

export default function editorController ()
{
  const proxy = (getCurrentInstance() as { proxy: Vue }).proxy as Vue

  // Refs
  const refs = {
    refIframePost: ref<InstanceType<typeof iframePost>>(),
    crudLayout: ref(null),
    refLayoutList: ref<InstanceType<typeof layoutList>>(),
    refBlockList: ref<InstanceType<typeof blockList>>(),
    handleGrid: ref<InstanceType<typeof handleGrid>>(),
    refBlockForm: ref<InstanceType<typeof blockForm>>(),
    blockAttributesForm: ref<InstanceType<typeof blockAttributesForm>>(),
  }

  // States
  const state = reactive<StateProps>({
    blocks: [],
    layoutTab: 'builder',
    layoutClone: null,
    loading: false,
    showBlocksPanel: false,
    showLayoutPanel: false,
    showBlockAttributesForm: false,
    infoToCreateBlock: {
      view: 'layout',
      index: 0,
      layoutId: null,
      parentSystemName: null
    },
    gridBlocks: [],
    view: 'layout'
  })

  // Computed
  const computeds = {
    // Validate the color by selectedTab
    tabColor: computed(() => state.layoutTab == 'preview' ? 'indigo-10' : 'orange-10'),
    //Return the selected title to the header of preview section
    titleTab: computed(() =>
    {
      const layoutTitle = store.layoutSelected?.title ? `${store.layoutSelected.id} | ${store.layoutSelected.title}` :
        proxy.$tr('ibuilder.cms.layout')
      const blockTitle = store.viewBlockSelected?.internalTitle ? `${store.viewBlockSelected.id} | ${store.viewBlockSelected?.internalTitle}` :
        proxy.$tr('isite.cms.label.block')

      return state.view === 'layout' ? layoutTitle : blockTitle
    }),
    //Get config of handleGrid
    configHandleGrid: computed(() => ({
      orderBy: "sortOrder",
      titleField: "gridLabel",
      canAddNewItem: true,
      actions: {
        blockDelete: {
          label: proxy.$tr('isite.cms.label.delete'),
          icon: 'fa-regular fa-trash',
          color: 'red',
          action: (data) => methods.alertDeleteBlock(data)
        },
        blockContent: {
          label: proxy.$tr('ibuilder.cms.label.content'),
          icon: 'fa-regular fa-book',
          action: (data) =>
          {
            refs.refBlockForm.value?.updateData(data)
          }
        },
        blockAttriutes: {
          label: proxy.$tr('ibuilder.cms.label.attributes'),
          icon: 'fa-regular fa-palette',
          action: (data) =>
          {
            state.showBlockAttributesForm = true
            setTimeout(() => refs.blockAttributesForm?.value?.edit(data), 500)
          }
        }
      },
    })),
    //Actions of dropdown
    dropdownActions: computed(() =>
    {
      return {
        redirect: [
          {
            title: proxy.$tr('isite.cms.showSite'),
            props: {
              tag: 'a',
              href: proxy.$store.state.qsiteApp.baseUrl,
              target: '_blank',
              id: 'siteActionGoToSite'
            }
          }
        ],
        editor: [
          {label: 'Layout', value: 'layout'},
          {label: 'Block', value: 'block'}
        ]
      }
    }),
  }

  // Methods
  const methods = {
    //Get all config Blocks
    getConfigBlocks: async () =>
    {
      state.loading = true

      //Instance the request params
      const requestParams = {filter: {allTranslations: true, configNameByModule: 'blocks'}}

      //Get configs
      const config = await service.getModuleBlocks(true, requestParams)

      //Map blockConfigs to get an array with all blocks
      const response: ModuleBlockConfig[] = []
      const blockConfigsByModule = Object.values(config).filter(item => item)
      blockConfigsByModule.forEach(configModule =>
      {
        Object.values(configModule).forEach(blockConfig =>
        {
          //Added blockConfig to all configs like child
          if (blockConfig.systemName !== store.mainBlockSystemName)
          {
            blockConfig.childBlocks = {
              mainblock: store.mainBlockSystemName,
              ...(blockConfig.childBlocks || {})
            }
          }
          //Save data of modules
          response.push(blockConfig)
        })
      })

      store.blockConfigs = response
      state.loading = false
    },
    // Open the preview
    previewPage ()
    {
      if (state.layoutTab === 'preview')
      {
        setTimeout(() =>
        {
          if (refs.refIframePost?.value?.loadIframe && store.layoutSelected)
            refs.refIframePost.value.loadIframe(
              `${proxy.$store.state.qsiteApp.baseUrl}/api/ibuilder/v1/layout/preview/${store.layoutSelected.id}`,
              {...store.layoutSelected, blocks: state.blocks}
            )
        }, 300)
      }
    },
    // Open the preview Block
    previewBlock ()
    {
      setTimeout(() =>
      {
        if (refs.refIframePost?.value?.loadIframe && store.viewBlockSelected?.id)
          refs.refIframePost.value.loadIframe(
            `${proxy.$store.state.qsiteApp.baseUrl}/api/ibuilder/v1/block/preview`,
            store.viewBlockSelected
          )
      }, 300)
    },
    // Refresh the api data
    async refreshApiData ({crudAction = '', emitSelected = true})
    {
      if (crudAction == 'deleted') store.resetSelecteds()
      state.loading = true
      let resLoading;
      if (state.view == 'layout')
      {
        resLoading = await refs.refLayoutList?.value?.refreshLayouts({crudAction, emitSelected}) || false;
      } else
      {
        resLoading = await refs.refBlockList?.value?.refreshBlocks(crudAction) || false;
      }
      state.loading = resLoading
    },
    // Handle the layout selected
    handleLayoutSelected ()
    {
      state.blocks = proxy.$clone(store.layoutSelected?.blocks || [])
      methods.setTheGridBlocks()
      state.layoutTab = 'builder'
    },
    // Set the grid blocks
    setTheGridBlocks ()
    {
      const blocks = proxy.$clone(state.blocks ?? []);

      //Get the systemName of the block with allowChildren
      const configBlocks = store.blockConfigs
        .filter(config => config.allowChildren)
        .map(config => config.systemName);

      // Include the attribute children for draggable component to the needed blocks
      const result = blocks.map(block =>
      {
        if (configBlocks.includes(block?.component?.systemName) && !block?.children?.length) block.children = [];
        block.gridLabel = `${block.id} | ${block.internalTitle}`
        return block
      }).sort((a, b) => a['sortOrder'] - b['sortOrder'])

      //@ts-ignore
      state.gridBlocks = proxy.$array.builTree(result || [], 0, {
        parentFieldName: 'parentSystemName',
        parentFieldValue: 'systemName'
      })
    },
    //Handle the creation block
    handleCreatingBlock (val)
    {
      state.infoToCreateBlock.view = state.view
      state.infoToCreateBlock.index = val ? val.children.length : state.gridBlocks.length
      state.infoToCreateBlock.parentSystemName = val?.systemName || null
      state.infoToCreateBlock.layoutId = store.layoutSelected?.id || null
      state.showBlocksPanel = true
    },
    //Handle the created blocks
    handleChangesBlock ({
                          block = null,
                          wasDeleted = false,
                          refresh = false,
                          update = false,
                          persistModalAttributes = false,
                          crudAction = '',
                          cancel = false
                        }: PropsHandleChangesBlock)
    {
      if (state.view == 'block')
      {
        if (wasDeleted) store.viewBlockSelected = null
        if (cancel) setTimeout(() => methods.previewBlock(), 500)
      }

      if (block)
      {
        //Update block data
        if (update) methods.handleUpdateBlock({block})
        //Refresh de layoutPanel data
        if (refresh || state.view == 'block') methods.refreshApiData({crudAction, emitSelected: false})


        if (state.view == 'layout')
        {
          let blockIndex = state.blocks.findIndex(item => item.id == block.id)
          if (blockIndex >= 0)
          {
            if (wasDeleted) state.blocks.splice(blockIndex, 1)
            else state.blocks.splice(blockIndex, 1, block)
          } else state.blocks = [...state.blocks, block]

          methods.setTheGridBlocks()
        }
      }
      state.showBlocksPanel = false
      state.showBlockAttributesForm = persistModalAttributes
    },
    //Handle when action create into layout
    async handleCreateLayout (layout: Layout, isCreated = false)
    {
      //Handle when creating layout
      if (!isCreated)
      {
        state.layoutClone = proxy.$clone(layout);
        //@ts-ignore
        refs.crudLayout.value?.create(layout)
      } else
      {
        //Handle when layout is created
        state.showLayoutPanel = false
        state.loading = true

        const blocks = proxy.$clone(state.layoutClone?.blocks ?? [])

        //Map the blocks
        blocks.forEach(block =>
        {
          //Define first
          const newSystemName = proxy.$uid() as string

          //Map if has childs
          blocks.forEach(child =>
          {
            //Check if the parent has childs
            if (child.parentSystemName === block.systemName)
            {
              child.parentSystemName = newSystemName;
            }
          });

          //Changes principal values in block
          block.entity = {} as any
          block.systemName = newSystemName
          block.layoutId = layout.id

        })

        await service.blocksBulkCreate(blocks, store.ignoreConfigKeys).then(response =>
        {
          proxy.$alert.info({message: proxy.$tr('isite.cms.message.recordUpdated')});
          methods.refreshApiData({crudAction: 'created'})
        }).catch(error =>
        {
          proxy.$alert.error({message: proxy.$tr('isite.cms.message.recordNoUpdated')});
          state.loading = false
        })
      }

    },
    // Save the blocks of layout
    async saveBlocks ()
    {
      state.loading = true
      const layoutsBlocks = state.blocks.map(block => ({
        sortOrder: block.sortOrder,
        parentSystemName: block.parentSystemName,
        layoutId: block.layoutId ?? store.layoutSelected?.id,
        blockId: block.id,
        gridPosition: block.gridPosition
      }))
      console.warn(layoutsBlocks)
      await service.layoutBlocksBulkUpdate(layoutsBlocks).then(response =>
      {
        proxy.$alert.info({message: proxy.$tr('isite.cms.message.recordUpdated')});
        methods.refreshApiData({})
        state.loading = false
      }).catch(error =>
      {
        proxy.$alert.error({message: proxy.$tr('isite.cms.message.recordNoUpdated')});
        state.loading = false
      })
    },
    // Update block
    async handleUpdateBlock ({block, params = {}})
    {
      await service.updateBlock(block.id, block, params).then(response =>
      {
        state.loading = false
        proxy.$alert.info({message: proxy.$tr('isite.cms.message.recordUpdated')});
      }).catch(error =>
      {
        state.loading = false
        proxy.$alert.error({message: proxy.$tr('isite.cms.message.recordNoUpdated')});
      })
    },
    //Remove block from layout
    async deleteBlock (block)
    {
      state.loading = true
      if(state.view === 'layout') await service.deleteRelationblock(block.id, store.layoutSelected?.id, block.parentSystemName)
      else await service.deleteblock(block.id)
      methods.handleChangesBlock({block, wasDeleted: true, refresh: true})
    },
    async handleDeleteLayout (layout: Layout)
    {
      //@ts-ignore
      refs.crudLayout.value?.delete(layout)
    },
    //Go Home
    goHome ()
    {
      const pathHome = proxy.$router.resolve({name: 'app.home'})
      window.open(pathHome.href, '_blank');
    },
    //Open block Panel
    openBlockPanel ()
    {
      //Reset values to block Panel
      state.infoToCreateBlock = {
        view: state.view,
        index: 0,
        layoutId: null,
        parentSystemName: null
      }

      setTimeout(() => state.showBlocksPanel = true, 100)
    },
    //Actions button of Block
    handleActionsBlock (action: string)
    {
      //Action when updated attributes
      if (action == 'updateAttr')
      {
        state.showBlockAttributesForm = true
        setTimeout(() => refs.blockAttributesForm?.value?.edit(store.viewBlockSelected), 500)
      } else if (action == 'delete') methods.alertDeleteBlock(store.viewBlockSelected) //Action when delete
    },
    //Alert before delete Block
    alertDeleteBlock (data: any)
    {
      proxy.$alert.error({
        mode: 'modal',
        title: data.internalTitle,
        message: proxy.$tr('isite.cms.message.deleteRecord'),
        actions: [
          {label: proxy.$tr('isite.cms.label.cancel'), color: 'grey-8'},
          {
            label: proxy.$tr('isite.cms.label.accept'),
            color: 'green',
            handler: () => methods.deleteBlock(data)
          },
        ]
      })
    }
  }

  // Mounted
  onMounted(() =>
  {
    methods.getConfigBlocks()
  })

  onUnmounted(() =>
  {
    store.resetSelecteds()
  })

  watch(() => state.gridBlocks, (newValue, oldValue): void =>
  {
    //@ts-ignore
    state.blocks = proxy.$array.destroyNestedItems(proxy.$clone(newValue), null, {
      parentFieldName: 'parentSystemName',
      parentFieldValue: 'systemName'
    })
  }, {deep: true})

  watch(() => state.view, (newValue, oldValue): void =>
  {
    store.resetSelecteds()
  })

  return {...refs, ...(toRefs(state)), ...computeds, ...methods, store}
}
