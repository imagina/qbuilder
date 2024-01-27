import Vue, {computed, reactive, ref, onMounted, toRefs, watch, getCurrentInstance} from "vue";
import store from '@imagina/qbuilder/_components/blockAttributesForm/store'
import storeEditor from '@imagina/qbuilder/_pages/admin/editor/store'
import {
  Block,
  ModuleBlockConfig
} from '@imagina/qbuilder/_components/blocksPanel/interface'
import iframePost from "@imagina/qsite/_components/v3/iframePost/index.vue";
import {debounce} from 'quasar'

interface StateProps {
  block: Block,
  selectedComponentKey: string
  oldSelectedComponentKey: string
  tabName: 'attributes' | 'content',
  oldTabName: string,
  formAttributes: any,
  formContent: any,
  panelWidth: string
}

export default function controller(props: any, emit: any) {
  const proxy = (getCurrentInstance() as { proxy: Vue }).proxy as Vue

  // Refs
  const refs = {
    refIframePost: ref<InstanceType<typeof iframePost>>(),
  }

  // States
  const state = reactive<StateProps>({
    block: {} as Block,
    selectedComponentKey: 'componentAttributes',
    oldSelectedComponentKey: '',
    tabName: 'attributes',
    oldTabName: '',
    formAttributes: {},
    formContent: {},
    panelWidth: '550px'
  })

  // Computed
  const computeds = {
    //Returns the color of tabs
    tabColor: computed(() => state.tabName == 'attributes' ? 'purple' : 'orange'),
    // returns the block config from state.block
    blockConfig: computed<ModuleBlockConfig | null | undefined>(() => {
      if (!state.block.id) return null
      //Response
      return storeEditor.blockConfigs.find(config => {
        return config.systemName == state.block.component?.systemName
      })
    }),
    // Returns the block configs of the block and its child blocks
    componentsConfig: computed<ModuleBlockConfig[]>(() => {
      if (!computeds.blockConfig.value) return []

      //Get the child blocks syste Names
      const childBlocksSystemName = Object.values(computeds.blockConfig.value.childBlocks || {})

      //Merge the selected block with its child blocks
      let configBlocks = [computeds.blockConfig.value, ...storeEditor.blockConfigs.filter(config => {
        return childBlocksSystemName.includes(config.systemName)
      })]

      //Set localFormName
      configBlocks = configBlocks.map(configBlock => {
        configBlock.componentKey = 'componentAttributes'
        //Define bockKey
        for (const [name, systemName] of Object.entries(computeds.blockConfig.value.childBlocks)) {
          if (systemName == configBlock.systemName) configBlock.componentKey = name
        }
        //Response
        return configBlock
      })

      //Response
      return configBlocks
    }),
    //Return the config of selected component
    selectedComponent: computed(() => {
      return computeds.componentsConfig.value.find(comp => comp.componentKey == state.selectedComponentKey)
    }),
    //Return the config of dynamic-form to attributes
    attributesForm: computed(() => {
      if (!computeds.selectedComponent.value) return []
      return Object.values(computeds.selectedComponent.value.attributes)
    }),
    //Return the config of dynamic-form to attributes
    contentForm: computed(() => {
      if (!computeds.selectedComponent.value) return []
      let fields = computeds.selectedComponent.value.contentFields || {}

      //Set fakeFieldName
      for (const [fieldName, field] of Object.entries(fields)) {
        //@ts-ignore
        fields[fieldName] = {...field, fakeFieldName: computeds.selectedComponent.value.componentKey}
      }

      //Response
      return [{name: 'maincontent', title: 'Contenido (PT)', fields: fields}]
    })
  }

  // Methods
  const methods = {
    edit: (block) => {
      state.block = block
      methods.setVModels(state.block, state.block.attributes[state.selectedComponentKey])
    },
    //Show the block preview
    previewBlock() {
      setTimeout(() => {
        if (refs.refIframePost?.value?.loadIframe && state.block.id)
          refs.refIframePost.value.loadIframe(
            `${proxy.$store.state.qsiteApp.baseUrl}/api/ibuilder/v1/block/preview`,
            state.block
          )
      }, 2500)
    },
    //Merge the data from forms into blockdata
    mergeDataForm: debounce((data) => {
      let componentKey = computeds.selectedComponent.value?.componentKey

      //Check that you haven't changed tabs
      if ((componentKey && componentKey === state.oldSelectedComponentKey) && (state.tabName == state.oldTabName)) {
        //Merge The data according to tabName
        if (state.tabName == 'attributes') {
          //Trigger state.block watch
          state.block = {
            ...state.block,
            attributes: {
              ...state.block.attributes,
              [componentKey]: proxy.$clone({
                ...state.block.attributes[componentKey],
                ...state.formAttributes
              })
            }
          }
        } else state.block = proxy.$clone(proxy.$helper.deepMergeObjects(state.block, state.formContent))
      } else {
        state.oldSelectedComponentKey = componentKey
        state.oldTabName = proxy.$clone(state.tabName)
      }
    }, 2000),
    //Set v-model states
    setVModels: (dataForm, dataAttributes) => {
      proxy.$nextTick(() => {
        state.formAttributes = proxy.$clone(dataAttributes)
        state.formContent = proxy.$clone(dataForm)
      })
    }
  }

  // Mounted
  onMounted(() => {
  })

  // Watch - TODO: Revisar esto debería de setear la data existente del bloque en cada cambio de selectedComponentKey para los formularios
  watch(() => state.selectedComponentKey, (newField, oldField) => {
    //Set the previous tab where it was
    state.oldSelectedComponentKey = oldField
    methods.setVModels(state.block, state.block.attributes[newField])

  });

  watch(() => state.block, (newField, oldField) => {

    methods.previewBlock();
  });

  //Set the previous tab where it was
  watch(() => state.tabName, (newField, oldField) => {

    state.oldTabName = oldField
  });

  return {...refs, ...(toRefs(state)), ...computeds, ...methods, store}
}
