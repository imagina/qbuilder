import { computed, onMounted, onUnmounted, reactive, ref, toRefs, watch } from 'vue';
import service from 'src/modules/qbuilder/_pages/admin/editor/services';
import store from 'src/modules/qbuilder/_pages/admin/editor/store';
import iframePost from 'src/modules/qsite/_components/v3/iframePost/index.vue';
import layoutList from 'src/modules/qbuilder/_components/layoutList/index.vue';
import blockList from 'src/modules/qbuilder/_components/blockList/index.vue';
import handleGrid from 'src/modules/qsite/_components/v3/handleGrid/index.vue';
import blockForm from 'src/modules/qbuilder/_components/blockContentForm/index.vue';
import blockAttributesForm from 'src/modules/qbuilder/_components/blockAttributesForm/index.vue';
import { Block, ModuleBlockConfig, PivotBlock } from 'src/modules/qbuilder/_components/blocksPanel/interface';
import { Layout } from 'src/modules/qbuilder/_components/layoutList/interface';
import { i18n, clone, store as globalStore, array, uid, alert, router } from 'src/plugins/utils';

interface PropInfoToCreateBlock {
  index: number,
  layoutId: number | null,
  parentSystemName: string | null
}

interface PivotBlockCustom extends PivotBlock {
  systemName: string;
  gridLabel: string;
  children?: PivotBlockCustom[];
}

interface StateProps {
  blocks: Block[];
  layoutTab: 'builder' | 'preview',
  layoutClone: Layout | null,
  loading: boolean,
  showBlocksPanel: boolean,
  showLayoutPanel: boolean,
  showBlockAttributesForm: boolean,
  infoToCreateBlock: PropInfoToCreateBlock,
  gridBlocks: PivotBlockCustom[]
  view: 'layout' | 'block'
}

interface PropsHandleChangesBlock {
  block: null | Block,
  wasDeleted: boolean,
  refresh: boolean,
  update?: boolean
  persistModalAttributes?: boolean
  crudAction?: string
  cancel?: boolean
}

export default function editorController() {

  // Refs
  const refs = {
    refIframePost: ref<InstanceType<typeof iframePost>>(),
    crudLayout: ref(null),
    crudLayoutDemo: ref(null),
    refLayoutList: ref<InstanceType<typeof layoutList>>(),
    refBlockList: ref<InstanceType<typeof blockList>>(),
    handleGrid: ref<InstanceType<typeof handleGrid>>(),
    refBlockForm: ref<InstanceType<typeof blockForm>>(),
    blockAttributesForm: ref<InstanceType<typeof blockAttributesForm>>()
  };

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
    gridBlocks: [],
    view: 'layout'
  });

  // Computed
  const computeds = {
    // Validate the color by selectedTab
    tabColor: computed(() => state.layoutTab == 'preview' ? 'indigo-10' : 'orange-10'),
    //Return the selected title to the header of preview section
    titleTab: computed(() => {
      const layoutTitle = store.layoutSelected?.title ? `${store.layoutSelected.id} | ${store.layoutSelected.title}` :
        i18n.tr('ibuilder.cms.layout');
      const blockTitle = store.viewBlockSelected?.internalTitle ? `${store.viewBlockSelected.id} | ${store.viewBlockSelected?.internalTitle}` :
        i18n.tr('isite.cms.label.block');

      return state.view === 'layout' ? layoutTitle : blockTitle;
    }),
    //Get config of handleGrid
    configHandleGrid: computed(() => ({
      orderBy: 'sortOrder',
      titleField: 'gridLabel',
      canAddNewItem: true,
      actions: {
        blockDelete: {
          label: i18n.tr('isite.cms.label.delete'),
          icon: 'fa-regular fa-trash',
          color: 'red',
          action: (data) => {
            //Find block data
            const blockData = state.blocks.find(block => block.pivot.id === data.id);
            if (blockData) methods.alertDeleteBlock(blockData);
          }
        },
        blockContent: {
          label: i18n.tr('ibuilder.cms.label.content'),
          icon: 'fa-regular fa-book',
          action: (data) => {
            const blockId = parseInt(data.blockId)
            const updateData = state.blocks.find(block => block.id === blockId);
            if (updateData) refs.refBlockForm.value?.updateData(updateData);
          }
        },
        blockAttriutes: {
          label: i18n.tr('ibuilder.cms.label.attributes'),
          icon: 'fa-regular fa-palette',
          action: (data) => {
            const blockId = parseInt(data.blockId)
            state.showBlockAttributesForm = true;
            const updateData = state.blocks.find(block => block.id === blockId);
            if (updateData) setTimeout(() => refs.blockAttributesForm?.value?.edit(updateData), 500);
          }
        }
      }
    })),
    //Actions of dropdown
    dropdownActions: computed(() => {
      return {
        redirect: [
          {
            title: i18n.tr('isite.cms.showSite'),
            props: {
              tag: 'a',
              href: globalStore.state.qsiteApp.baseUrl,
              target: '_blank',
              id: 'siteActionGoToSite'
            }
          }
        ],
        editor: [
          { label: 'Layout', value: 'layout' },
          { label: 'Block', value: 'block' }
        ]
      };
    })
  };

  // Methods
  const methods = {
    //Get all config Blocks
    getConfigBlocks: async () => {
      state.loading = true;

      //Instance the request params
      const requestParams = { filter: { allTranslations: true, configNameByModule: 'blocks' } };

      try {
        //Get configs
        const config = await service.getModuleBlocks(true, requestParams);
        //Map blockConfigs to get an array with all blocks
        const response: ModuleBlockConfig[] = [];
        const blockConfigsByModule = Object.values(config).filter(item => item);
        blockConfigsByModule.forEach(configModule => {
          Object.values(configModule).forEach(blockConfig => {
            //Added blockConfig to all configs like child
            if (blockConfig.systemName !== store.mainBlockSystemName) {
              blockConfig.childBlocks = {
                mainblock: store.mainBlockSystemName,
                ...(blockConfig.childBlocks || {})
              };
            }
            //Save data of modules
            response.push(blockConfig);
          });
        });

        store.blockConfigs = response;
      } catch (e) {
        console.error(e);
        alert.error(this.$tr('isite.cms.message.errorRequest'));
      }
      state.loading = false;
    },
    // Open the preview
    previewPage() {
      if (state.layoutTab === 'preview') {
        setTimeout(() => {
          if (refs.refIframePost?.value?.loadIframe && store.layoutSelected)
            refs.refIframePost.value.loadIframe(
              `${globalStore.state.qsiteApp.baseUrl}/api/ibuilder/v1/layout/preview/${store.layoutSelected.id}`,
              { ...store.layoutSelected, blocks: state.blocks }
            );
        }, 300);
      }
    },
    // Open the preview Block
    previewBlock() {
      setTimeout(() => {
        if (refs.refIframePost?.value?.loadIframe && store.viewBlockSelected?.id)
          refs.refIframePost.value.loadIframe(
            `${globalStore.state.qsiteApp.baseUrl}/api/ibuilder/v1/block/preview`,
            store.viewBlockSelected
          );
      }, 300);
    },
    // Refresh the api data
    async refreshApiData({ crudAction = '', emitSelected = true }) {
      if (crudAction == 'deleted') store.resetSelecteds();
      state.loading = true;
      try {
        if (state.view == 'layout') {
          await refs.refLayoutList?.value?.refreshLayouts({ crudAction, emitSelected });
        } else {
          await refs.refBlockList?.value?.refreshBlocks(crudAction);
        }
      } catch (e) {
        console.error(e);
      }

      state.loading = false;
    },
    // Handle the layout selected
    handleLayoutSelected() {
      state.blocks = clone(store.layoutSelected?.blocks || []);
      methods.setTheGridBlocks();
      state.layoutTab = 'builder';
    },
    // Set the grid blocks
    setTheGridBlocks() {
      const blocks = clone(state.blocks ?? []);

      //Get the systemName of the block with allowChildren
      const configBlocks = store.blockConfigs
        .filter(config => config.allowChildren)
        .map(config => config.systemName);

      // Include the attribute children for draggable component to the needed blocks
      const result: PivotBlockCustom[] = blocks.map(block => {
        let response: PivotBlockCustom = {
          ...block.pivot,
          gridLabel: `${block.id} | ${block.internalTitle}`
        };

        if (configBlocks.includes(block?.component?.systemName) && !block?.children?.length) response.children = [];

        return response;
      }).sort((a, b) => a.sortOrder - b.sortOrder);

      //@ts-ignore
      state.gridBlocks = array.builTree(result || [], 0, {
        parentFieldName: 'parentSystemName',
        parentFieldValue: 'systemName'
      });
    },
    //Handle the creation block
    handleCreatingBlock(val) {
      state.infoToCreateBlock = {
        ...state.infoToCreateBlock,
        index: val ? val.children.length : state.gridBlocks.length,
        parentSystemName: val?.systemName || null,
        layoutId: store.layoutSelected?.id || null
      };
      state.showBlocksPanel = true;
    },
    //Handle the created blocks
    handleChangesBlock({
                         block = null,
                         wasDeleted = false,
                         refresh = false,
                         update = false,
                         persistModalAttributes = false,
                         crudAction = '',
                         cancel = false
                       }: PropsHandleChangesBlock) {
      if (state.view == 'block') {
        if (wasDeleted) store.viewBlockSelected = null;
        if (cancel) setTimeout(() => methods.previewBlock(), 500);
        if (update) store.viewBlockSelected = block
      }

      if (block) {
        //Update block data
        if (update) methods.handleUpdateBlock({ block });
        //Refresh API data
        if (refresh || state.view == 'block') methods.refreshApiData({ crudAction, emitSelected: false });


        if (state.view == 'layout') {
          let blockIndex = state.blocks.findIndex(item => item.pivot.id === block.pivot?.id);
          if (blockIndex >= 0) {
            if (wasDeleted) state.blocks.splice(blockIndex, 1);
            else {
              //Maps all blocks that have the id of the block to edit repeated
              state.blocks = state.blocks.map(mapBlock => {
                if (mapBlock.id === block.id) return { ...block, pivot: mapBlock.pivot };
                return mapBlock;
              });
            }
          } else if (!wasDeleted) state.blocks = [...state.blocks, block];

          methods.setTheGridBlocks();
        }
      }
      state.showBlocksPanel = false;
      state.showBlockAttributesForm = persistModalAttributes;
    },
    //Handle when action create into layout
    async handleCreateLayout(layout: Layout, isCreated = false) {
      //Handle when creating layout
      if (!isCreated) {
        state.layoutClone = clone(layout);
        //@ts-ignore
        refs.crudLayout.value?.create(layout);
      } else {
        //Handle when layout is created
        state.showLayoutPanel = false;
        state.loading = true;

        const blocks = clone(state.layoutClone?.blocks ?? []);

        //Map the blocks
        blocks.forEach(block => {
          //Define first
          const newSystemName = uid();

          //Map if has childs
          blocks.forEach(child => {
            child.layouts = child.layouts || {};
            child.layouts[layout.id] = child.layouts[layout.id] || {};
            //Check if the parent has childs
            if (child.pivot?.parentSystemName === block.pivot?.systemName) {
              child.layouts[layout.id].parentSystemName = newSystemName;
            }
          });

          //Changes principal values in block
          block.entity = {} as any;
          block.systemName = uid();
          delete block.id;
          block.layouts = block.layouts || {};
          block.layouts[layout.id] = {
            ...(block.layouts[layout.id] ?? {}),
            systemName: newSystemName,
            gridPosition: block.pivot.gridPosition,
            sortOrder: block.pivot.sortOrder
          };
        });

        await service.blocksBulkCreate(blocks, store.ignoreConfigKeys).then(response => {
          alert.info({ message: i18n.tr('isite.cms.message.recordUpdated') });
          methods.refreshApiData({ crudAction: 'created' });
        }).catch(error => {
          alert.error({ message: i18n.tr('isite.cms.message.recordNoUpdated') });
          state.loading = false;
        });
      }

    },
    // Save the blocks relations of layout
    async savePivotBlocks() {
      state.loading = true;
      const layoutsBlocks = state.blocks.map(block => ({
        ...block.pivot
      }));
      await service.layoutBlocksBulkUpdate(layoutsBlocks).then(response => {
        alert.info({ message: i18n.tr('isite.cms.message.recordUpdated') });
        methods.refreshApiData({});
        state.loading = false;
      }).catch(error => {
        alert.error({ message: i18n.tr('isite.cms.message.recordNoUpdated') });
        state.loading = false;
      });
    },
    // Update block
    async handleUpdateBlock({ block, params = {} }) {
      await service.updateBlock(block.id, block, params).then(response => {
        state.loading = false;
        alert.info({ message: i18n.tr('isite.cms.message.recordUpdated') });
      }).catch(error => {
        state.loading = false;
        alert.error({ message: i18n.tr('isite.cms.message.recordNoUpdated') });
      });
    },
    //Remove block from layout
    async deleteBlock(block) {
      state.loading = true;
      if (state.view === 'layout') await service.deleteRelationblock(block.pivot.id);
      else await service.deleteblock(block.id);
      methods.handleChangesBlock({ block, wasDeleted: true, refresh: true });
    },
    async handleDeleteLayout(layout: Layout) {
      //@ts-ignore
      refs.crudLayout.value?.delete(layout);
    },
    //Go Home
    goHome() {
      const pathHome = router.resolve({ name: 'app.home' });
      window.open(pathHome.href, '_blank');
    },
    //Open block Panel
    openBlockPanel() {
      //Reset values to block Panel
      state.infoToCreateBlock = {
        index: 0,
        layoutId: null,
        parentSystemName: null
      };

      setTimeout(() => state.showBlocksPanel = true, 100);
    },
    //Actions button of Block
    handleActionsBlock(action: string) {
      //Action when updated attributes
      if (action == 'updateAttr') {
        state.showBlockAttributesForm = true;
        setTimeout(() => refs.blockAttributesForm?.value?.edit(store.viewBlockSelected), 500);
      } else if (action == 'delete') methods.alertDeleteBlock(store.viewBlockSelected); //Action when delete
    },
    //Alert before delete Block
    alertDeleteBlock(data: any) {
      alert.error({
        mode: 'modal',
        title: data.internalTitle ?? `${data.id} | Block ID: ${data.blockId ?? ''}`,
        message: i18n.tr('isite.cms.message.deleteRecord'),
        actions: [
          { label: i18n.tr('isite.cms.label.cancel'), color: 'grey-8' },
          {
            label: i18n.tr('isite.cms.label.accept'),
            color: 'green',
            handler: () => methods.deleteBlock(data)
          }
        ]
      });
    }
  };

  // Mounted
  onMounted(() => {
    methods.getConfigBlocks();
  });

  onUnmounted(() => {
    store.resetSelecteds();
  });

  watch(() => state.gridBlocks, (newValue, oldValue): void => {
    //@ts-ignore
    const pivotBlock = array.destroyNestedItems(clone(newValue), null, {
      parentFieldName: 'parentSystemName',
      parentFieldValue: 'systemName'
    });

    const mapPivotBlocks: any[] = [];
    pivotBlock.forEach(pivot => {
      let singleBlock = state.blocks.find(block => block.pivot.id == pivot.id);

      if (!!singleBlock) {
        singleBlock.pivot = {
          ...singleBlock.pivot,
          ...pivot
        };

        mapPivotBlocks.push(singleBlock);
      }
    });

    state.blocks = mapPivotBlocks;
  }, { deep: true });

  watch(() => state.view, (newValue, oldValue): void => {
    store.resetSelecteds();
  });

  return { ...refs, ...(toRefs(state)), ...computeds, ...methods, store };
}
