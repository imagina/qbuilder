import {reactive} from 'vue';
import crud from '@imagina/qcrud/_services/baseService.js';

//States
const state = reactive({
  blocks: [],
  selectedblock: null
})

export default {
  state,
  //Get blocks data
  getBlocksData(refresh = false) {
    return new Promise((resolve, reject) => {
      //Requets params
      let requestParams = {refresh}
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
  selectBlock(block) {
    state.selectedblock = block
  }
}
