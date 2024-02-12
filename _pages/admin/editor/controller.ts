import Vue, {computed, onMounted, onUnmounted, reactive, ref, toRefs, watch, getCurrentInstance} from "vue";
import service from '@imagina/qbuilder/_pages/admin/editor/services'
import store from '@imagina/qbuilder/_pages/admin/editor/store'
import iframePost from "@imagina/qsite/_components/v3/iframePost/index.vue";
import layoutPanel from '@imagina/qbuilder/_components/layoutPanel/index.vue';
import handleGrid from '@imagina/qsite/_components/v3/handleGrid/index.vue';
import blockForm from '@imagina/qbuilder/_components/blockContentForm/index.vue'
import blockAttributesForm from '@imagina/qbuilder/_components/blockAttributesForm/index.vue';
import {Block, ModuleBlockConfig} from '@imagina/qbuilder/_components/blocksPanel/interface'
import {Layout} from '@imagina/qbuilder/_components/layoutPanel/interface'
import {biAward} from "@quasar/extras/bootstrap-icons";

interface PropInfoToCreateBlock
{
  index: number,
  layoutId: number | null,
  parentSystemName: string | null
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
}

interface PropsHandleChangesBlock
{
  block: null | Block,
  wasDeleted: boolean,
  refreshLayouts: boolean
}

export default function editorController ()
{
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
  const state = reactive<StateProps>({
    blocks: [],
    layoutTab: 'builder',
    layoutClone: null,
    loading: false,
    showBlocksPanel: false,
    showLayoutPanel: false,
    showBlockAttributesForm: false,
    infoToCreateBlock: {
      index: 0,
      layoutId: null,
      parentSystemName: null
    },
    gridBlocks: []
  })

  // Computed
  const computeds = {
    // Validate the color by selectedTab
    tabColor: computed(() => state.layoutTab == 'preview' ? 'indigo-10' : 'orange-10'),
    //Return the selected layout title to the header of preview section
    titleTab: computed(() =>
    {
      if (store.layoutSelected?.title) return `${store.layoutSelected.title} (${store.layoutSelected.id})`
      return proxy.$tr('ibuilder.cms.layout')
    }),
    //Get config of handleGrid
    configHandleGrid: computed(() => ({
      orderBy: "sortOrder",
      titleField: "internalTitle",
      canAddNewItem: true,
      actions: {
        blockDelete: {
          label: proxy.$tr('isite.cms.label.delete'),
          icon: 'fa-regular fa-trash',
          color: 'red',
          action: (data) =>
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
    }))
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
    // Refresh the layout data
    async refreshLayouts ({crudAction = '', emitSelected = true})
    {
      state.loading = true
      state.loading = await refs.refPanel?.value?.refreshLayouts({crudAction, emitSelected}) || false;
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
        if (configBlocks.includes(block?.component?.systemName) && !block?.children?.length)
        {
          block.children = [];
        }
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
      state.infoToCreateBlock.index = val ? val.children.length : state.gridBlocks.length
      state.infoToCreateBlock.parentSystemName = val?.systemName || null
      state.infoToCreateBlock.layoutId = store.layoutSelected?.id || null
      state.showBlocksPanel = true
    },
    //Handle the created blocks
    handleChangesBlock ({block = null, wasDeleted = false, refreshLayouts = false}: PropsHandleChangesBlock)
    {
      if (block)
      {
        //Refresh de layoutPanel data
        if (refreshLayouts) methods.refreshLayouts({emitSelected: false})
        //TODO: buscar si block ya existe en stateblocks y actualizarlo, si no, agregarlo
        let blockIndex = state.blocks.findIndex(item => item.id == block.id)
        if (blockIndex >= 0)
        {
          if (wasDeleted) state.blocks.splice(blockIndex, 1)
          else state.blocks.splice(blockIndex, 1, block)
        } else state.blocks = [...state.blocks, block]

        methods.setTheGridBlocks()
      }
      state.showBlocksPanel = false
      state.showBlockAttributesForm = false
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
          methods.refreshLayouts({crudAction: 'created'})
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
      await service.blocksBulkUpdate(state.blocks, store.ignoreConfigKeys).then(response =>
      {
        proxy.$alert.info({message: proxy.$tr('isite.cms.message.recordUpdated')});
        methods.refreshLayouts({})
        state.loading = false
      }).catch(error =>
      {
        proxy.$alert.error({message: proxy.$tr('isite.cms.message.recordNoUpdated')});
        state.loading = false
      })
    },
    //Remove block from layout
    async deleteBlock (block)
    {
      state.loading = true
      await service.deleteblock(block.id)
      methods.handleChangesBlock({block, wasDeleted: true, refreshLayouts: true})
      state.loading = false
    }
  }

  // Mounted
  onMounted(() =>
  {
    methods.getConfigBlocks()
  })

  onUnmounted(() =>
  {
    store.layoutSelected = null
  })

  watch(() => state.gridBlocks, (newValue, oldValue): void =>
  {
    //@ts-ignore
    state.blocks = proxy.$array.destroyNestedItems(proxy.$clone(newValue), null, {
      parentFieldName: 'parentSystemName',
      parentFieldValue: 'systemName'
    })
  }, {deep: true})

  return {...refs, ...(toRefs(state)), ...computeds, ...methods, store}
}
