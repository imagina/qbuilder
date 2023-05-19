import {reactive, computed} from 'vue';
import crud from '@imagina/qcrud/_services/baseService.js';
import helper from '@imagina/qsite/_plugins/helper'

//States
const state = reactive({
  loading: false,
  drawers: {
    blocksList: false,
    blocksShow: false,
  },
  blocks: [],
  blocksConfiguration: [],
  selectedBlock: null,
  formMainFields: {},
  formEntityFields: {},
  formExtraFields: {},
})

//Model to be able use state as v-model
const models = {
  blocksConfiguration: computed({
    get: () => {
      //Reduce an instance the blocks configuration data
      let response = Object.assign({}, ...Object.values(state.blocksConfiguration).filter(item => item))
      //Map the blocks configurations
      response = Object.values(response).map((block) => ({
        ...block,
        content: block.content || [],
        attributes: Object.values(block.attributes).map((item, index) => ({...item, name: index}))
      }))
      //response
      return response
    },
    set: (val) => state.blocksConfiguration = val
  }),
  formMainFields: computed({
    get: () => state.formMainFields,
    set: (val) => state.formMainFields = val
  }),
  formEntityFields: computed({
    get: () => state.formEntityFields,
    set: (val) => state.formEntityFields = val
  }),
  formExtraFields: computed({
    get: () => state.formExtraFields,
    set: (val) => state.formExtraFields = val
  }),
}

//Getters
const getters = {
  //Data to show the block preview
  dataBlockPreview: computed(() => {
    //Instance the attributes
    const component = state.selectedBlock.component
    const entity = state.selectedBlock.entity
    const attributes = {
      ...state.selectedBlock.attributes,
      componentAttributes: {
        ...state.selectedBlock.attributes.componentAttributes,
        //Merge all the fields into the componentAttributes
        ...((state.selectedBlock.fields || []).map(item => ({[helper.snakeToCamelCase(item.name)]: item.value}))
          .reduce((result, current) => Object.assign(result, current), {}))
      }
    }
    //Return
    return {component, entity, attributes}
  })
}

//Methods
const methods = {
  //Get blocks
  getBlocksData: (refresh = false) => {
    return new Promise((resolve, reject) => {
      state.loading = true
      //Requets params
      let requestParams = {
        refresh,
        params: {
          filter: {allTranslations: true},
          include: 'fields'
        }
      }
      //Request
      crud.index('apiRoutes.qbuilder.blocks', requestParams).then(response => {
        state.blocks = response.data
        state.drawers.blocksList = true
        state.loading = false
        resolve(response.data)
      }).catch(error => {
        state.loading = false
        resolve([])
      })
    })
  },
  //Get block configuration
  getBlocksConfiguration: (refresh = false) => {
    return new Promise((resolve, reject) => {
      state.loading = true
      //Params
      let requestParams = {
        refresh,
        params: {
          filter: {allTranslations: true, configNameByModule: 'blocks'}
        }
      }
      //Request
      crud.index('apiRoutes.qsite.configs', requestParams).then(response => {
        state.blocksConfiguration = response.data
        state.loading = false
        resolve(response.data)
      }).catch(error => {
        state.loading = false
        resolve([])
      })
    })
  },
  //Set the selected block
  setSelectedBlock(block) {
    state.selectedBlock = block
    state.drawers.blocksShow = true
  },
  //Finish Edit block
  closeBlockShow() {
    state.selectedBlock = null
    state.drawers.blocksShow = false
  }
}

export default {
  state,
  models,
  getters,
  methods,
}
