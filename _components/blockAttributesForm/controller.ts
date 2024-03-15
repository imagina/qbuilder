import { computed, reactive, ref, onMounted, toRefs, watch, nextTick } from 'vue';
import storeEditor from 'src/modules/qbuilder/_pages/admin/editor/store';
import serviceEditor from 'src/modules/qbuilder/_pages/admin/editor/services';
import {
  Block,
  PropsDynamicField
} from 'src/modules/qbuilder/_components/blocksPanel/interface';
import iframePost from 'src/modules/qsite/_components/v3/iframePost/index.vue';
import { debounce } from 'quasar';
import { i18n, clone, store as globalStore, alert, helper } from 'src/plugins/utils';

interface StateProps {
  allowEdit: boolean,
  block: Block,
  selectedComponentKey: string
  tabName: 'attributes' | 'content',
  formAttributes: any,
  formContent: any,
  panelWidth: string,
  loading: boolean,
  componentConfigs: any
}

export default function controller(props: any, emit: any) {
  // Refs
  const refs = {
    refIframePost: ref<InstanceType<typeof iframePost>>()
  };

  // States
  const state = reactive<StateProps>({
    allowEdit: false, //Indicator to allow edit forms and handle preview
    block: {} as Block,
    selectedComponentKey: 'componentAttributes',
    tabName: 'attributes',
    formAttributes: {},
    formContent: {},
    panelWidth: '650px',
    loading: false,
    componentConfigs: null
  });

  // Computed
  const computeds = {
    //Returns the color of tabs
    tabColor: computed(() => state.tabName == 'attributes' ? 'purple' : 'orange'),
    //Return the config of dynamic-form to attributes
    attributesForm: computed(() => {
      const selectedComponent = methods.selectedTabConfig();
      if (!selectedComponent) return [];
      return Object.values(selectedComponent.attributes);
    }),
    //Return the config of dynamic-form to attributes
    contentForm: computed(() => {
      const selectedComponent = methods.selectedTabConfig();
      if (!selectedComponent) return [];
      //Response
      return [{
        name: 'maincontent',
        title: i18n.tr('ibuilder.cms.label.content'),
        fields: selectedComponent.contentFields || {}
      }];
    })
  };

  // Methods
  const methods = {
    init: () => {
      methods.handleAllowEditIndicator();
    },
    // Statr to edit the block attributes
    edit: (block) => {
      state.block = clone(block);
      methods.getComponentsConfig(block.component?.systemName);
      methods.setVModels();
      methods.previewBlock();//Call update preview
    },
    //Set v-model states
    setVModels: () => {
      nextTick(() => {
        state.formAttributes = state.block.attributes[state.selectedComponentKey];
        state.formContent = state.block;
      });
    },
    // Returns the block configs of the block and its child blocks
    getComponentsConfig: (systemNameComponent: string) => {
      //Response
      const blockConfig = storeEditor.blockConfigs.find(config => {
        return config.systemName == systemNameComponent;
      });
      if (!blockConfig) return [];

      //Get the child blocks syste Names
      const childBlocksSystemName = Object.values(blockConfig.childBlocks || {});

      //Merge the selected block with its child blocks
      const configBlocks = [blockConfig, ...storeEditor.blockConfigs.filter(config => {
        return childBlocksSystemName.includes(config.systemName);
      })];

      //config of selected component
      state.componentConfigs = configBlocks.map(configBlock => {
        //Set localFormName
        configBlock.componentKey = 'componentAttributes';
        //Define blockKey
        for (const [name, systemName] of Object.entries(blockConfig.childBlocks)) {
          if (systemName == configBlock.systemName) configBlock.componentKey = name;
        }
        //Set fake field name
        if(configBlock?.contentFields) configBlock.contentFields = methods.setFakeFieldNameInContent(configBlock.contentFields, configBlock.componentKey)
        //Response
        return configBlock;
      });
    },
    //Update block
    updateBlock: ({ closeModal = false }) => {
      if (state.block) {
        state.loading = true;
        //Update block with editor service
        serviceEditor.updateBlock(state.block.id, state.block).then(response => {
          alert.info({ message: i18n.tr('isite.cms.message.recordUpdated') });
          //Emit info to Editor and Close Modal
          emit('updateBlock', { block: clone(state.block), persistModalAttributes: !closeModal });
          state.loading = false;
        }).catch(() => {
          alert.error({ message: i18n.tr('isite.cms.message.recordNoUpdated') });
          state.loading = false;
        });
      }
    },
    // Handle the allowEdit indicator
    handleAllowEditIndicator: () => {
      state.allowEdit = false;
      methods.enableAllowEditIndicator();
    },
    // AS a Debounce enable the edit the forms
    enableAllowEditIndicator: debounce(() => state.allowEdit = true, 1000),
    //Merge the data from forms into blockdata
    mergeDataForm() {
      if (state.allowEdit) {
        const selectedComponent = methods.selectedTabConfig();
        let componentKey = selectedComponent?.componentKey;
        if(!componentKey) return
        //Check that you haven't changed tabs
        //Merge The data according to tabName
        if (state.tabName == 'attributes') {
          //Trigger state.block watch
          state.block.attributes[componentKey] = clone({
            ...state.block.attributes[componentKey],
            ...state.formAttributes
          });
        } else state.block = clone(helper.deepMergeObjects(state.block, state.formContent));

        //Call update preview
        methods.previewBlock();
      }
    },
    //Show the block preview
    previewBlock: debounce(() => {
      if (refs.refIframePost?.value?.loadIframe && state.block.id)
        refs.refIframePost.value.loadIframe(
          `${globalStore.state.qsiteApp.baseUrl}/api/ibuilder/v1/block/preview`,
          state.block
        );
    }, 2000),
    //Define alert action when click button discard
    discardChanges() {
      alert.warning({
        mode: 'modal',
        title: i18n.tr('ibuilder.cms.label.sureDiscardBlock'),
        message: i18n.tr('ibuilder.cms.label.descriptionSureDiscardBlock'),
        actions: [
          { label: i18n.tr('isite.cms.label.cancel'), color: 'grey-8' },
          {
            label: i18n.tr('isite.cms.label.accept'),
            color: 'green',
            handler: () => emit('cancel')
          }
        ]
      });
    },
    //Verify if Has fields
    hasFields(obj) {
      //Checks if you have at least one object in the array
      if (!obj.length) return false;
      //Look for the fields key, which is an object and get the keys
      const keys = Object.keys(obj[0]?.fields ?? {});

      //Returns if you have one or more fields in fields
      return keys.length > 0;
    },
    //Get config of selected tab
    selectedTabConfig() {
      if (!state.componentConfigs) return false;
      return state.componentConfigs.find(comp => comp.componentKey == state.selectedComponentKey);
    },
    //Set fake field name in contentFields
    setFakeFieldNameInContent(fields: { [key: string]: PropsDynamicField }, componentKey: string) {
      //Set fakeFieldName
      for (const [fieldName, field] of Object.entries(fields)) {
        fields[fieldName] = {
          ...field,
          ...(field?.type !== 'media' ? { fakeFieldName: componentKey } : { fieldItemId: state.block.id })
        };
      }

      return fields
    }
  };

  // Mounted
  onMounted(() => {
    methods.init();
  });

  // Watch
  watch(() => state.selectedComponentKey, methods.setVModels);

  return { ...refs, ...(toRefs(state)), ...computeds, ...methods };
}
