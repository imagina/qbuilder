import {reactive, computed} from 'vue';
import crud from '@imagina/qcrud/_services/baseService.js';
import helper from '@imagina/qsite/_plugins/helper'

//States
const state = reactive({
  blocks: [],
  selectedBlock: null
})

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
  getters,
  //Get blocks data
  getBlocksData(refresh = false) {
    return new Promise((resolve, reject) => {
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
        resolve(response.data)
      }).catch(error => {
        resolve([])
      })
    })
  },
  //Set the selected block
  setSelectedBlock(block) {
    state.selectedBlock = block
  }
}
