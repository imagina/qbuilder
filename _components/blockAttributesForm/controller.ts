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
  allowEdit: Boolean,
  block: Block,
  selectedComponentKey: string
  tabName: 'attributes' | 'content',
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
    allowEdit: false, //Indicator to allow edit forms and handle preview
    block: {} as Block,
    selectedComponentKey: 'componentAttributes',
    tabName: 'attributes',
    formAttributes: {},
    formContent: {},
    panelWidth: '650px'
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
      return [{name: 'maincontent', title: proxy.$tr('ibuilder.cms.label.content'), fields: fields}]
    }),
    // General Actions
    generalActions: computed(() => {
      return [
        {
          props: {
            label: proxy.$tr('ibuilder.cms.label.discard'),
            color: 'grey-7',
            outline: true,
            rounded: true,
            class: 'q-mr-sm'
          },
          action: methods.discardChanges
        },
        {
          props: {
            label: proxy.$tr('ibuilder.cms.label.apply'),
            color: 'green',
            rounded: true
          },
          action: () => emit('input', proxy.$clone(state.block))
        }
      ]
    })
  }

  // Methods
  const methods = {
    init: () => {
      methods.handleAllowEditIndicator()
    },
    // Statr to edit the block attributes
    edit: (block) => {
      state.block = proxy.$clone(block);
      methods.setVModels()
      methods.previewBlock()//Call update preview
    },
    //Set v-model states
    setVModels: () => {
      proxy.$nextTick(() => {
        state.formAttributes = state.block.attributes[state.selectedComponentKey]
        state.formContent = state.block
      })
    },
    // Handle the allowEdit indicator
    handleAllowEditIndicator: () => {
      state.allowEdit = false
      methods.enableAllowEditIndicator()
    },
    // AS a Debounce enable the edit the forms
    enableAllowEditIndicator: debounce(() => state.allowEdit = true, 1000),
    //Merge the data from forms into blockdata
    mergeDataForm() {
      if (state.allowEdit) {
        let componentKey = computeds.selectedComponent.value?.componentKey

        //Check that you haven't changed tabs
        //Merge The data according to tabName
        if (state.tabName == 'attributes') {
          //Trigger state.block watch
          state.block.attributes[componentKey] = proxy.$clone({
            ...state.block.attributes[componentKey],
            ...state.formAttributes
          })
        } else {
          const formResult = proxy.$clone(state.formContent)
          const result = methods.getMediasFirstLevel(formResult)
          
          state.block = proxy.$clone(proxy.$helper.deepMergeObjects(state.block, {...formResult, ...result}))
        }

        //Call update preview
        methods.previewBlock()
      }
    },
    //Show the block preview
    previewBlock: debounce(() => {
      if (refs.refIframePost?.value?.loadIframe && state.block.id)
        refs.refIframePost.value.loadIframe(
          `${proxy.$store.state.qsiteApp.baseUrl}/api/ibuilder/v1/block/preview`,
          state.block
        )
    }, 2000),
    //Define alert action when click button discard
    discardChanges() {
      proxy.$alert.warning({
        mode: 'modal',
        title: proxy.$tr('ibuilder.cms.label.sureDiscardBlock'),
        message: proxy.$tr('ibuilder.cms.label.descriptionSureDiscardBlock'),
        actions: [
          {label: proxy.$tr('isite.cms.label.cancel'), color: 'grey-8'},
          {
            label: proxy.$tr('isite.cms.label.accept'),
            color: 'green',
            handler: () => emit('cancel')
          },
        ]
      })
    },
    //Verify if Has fields
    hasFields(obj) {
      //Checks if you have at least one object in the array
      if (!obj.length) return false
      //Look for the fields key, which is an object and get the keys
      const keys = Object.keys(obj[0]?.fields ?? {})

      //Returns if you have one or more fields in fields
      return keys.length > 0
    },
    //Get mediasSingle and mediasMulti
    getMediasFirstLevel(obj) {
      const response = {};
      const firstLevel = ['mediasSingle', 'mediasMulti'];

      function getMedias(obj) {
        for (let clave in obj) {
          let valor = obj[clave];
          if (valor && typeof valor === "object") {
            if (firstLevel.includes(clave)) {
              response[clave] = valor;
            } else {
              getMedias(valor); // Búsqueda recursiva
            }
          }
        }
      }

      getMedias(obj)
      return response
    }
  }

  // Mounted
  onMounted(() => {
    methods.init()
  })

  // Watch - TODO: Revisar esto debería de setear la data existente del bloque en cada cambio de selectedComponentKey para los formularios
  watch(() => state.selectedComponentKey, methods.setVModels);

  return {...refs, ...(toRefs(state)), ...computeds, ...methods, store}
}
