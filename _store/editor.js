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
  selectedBlock: null,
  formMainFields: {}
})

//Model to be able use state as v-model
const models = {
  formMainFields: computed({
    get: () => state.formMainFields,
    set: (val) => state.formMainFields = val
  })
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

export default {
  state,
  models,
  getters,
  //Get blocks data
  getBlocksData(refresh = false) {
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
