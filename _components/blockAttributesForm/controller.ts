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
  tabName: 'attributes' | 'content',
  formAttributes: any,
  formContent: any
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
    selectedComponentKey: null,
    tabName: 'attributes',
    formAttributes: {},
    formContent: {}
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
      // Todo: Revisar, esto es para disparar el watch y setear la data en los form en cada cambio del tab
      setTimeout(() => state.selectedComponentKey = 'componentAttributes', 1000)
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
      if (componentKey) {
        //Merge The data according to tabName
        if (state.tabName == 'attributes') {
          state.block.attributes[componentKey] = proxy.$clone({
            ...state.block.attributes[componentKey],
            ...state.formAttributes
          })
        } else state.block = proxy.$clone(proxy.$helper.deepMergeObjects(state.block, state.formContent))
      }
    }, 3000)
  }

  // Mounted
  onMounted(() => {
  })

  // Watch - TODO: Revisar esto debería de setear la data existente del bloque en cada cambio de selectedComponentKey para los formularios
  watch(() => state.selectedComponentKey, (newField, oldField) => {
    state.formAttributes = proxy.$clone(state.block.attributes[state.selectedComponentKey])
    state.formContent = proxy.$clone(state.block)
  });

  watch(() => state.block, (newField, oldField) => {
    methods.previewBlock();
  });

  return {...refs, ...(toRefs(state)), ...computeds, ...methods, store}
}
