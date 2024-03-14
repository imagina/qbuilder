import {getCurrentInstance} from "vue"
import baseService from '@imagina/qcrud/_services/baseService'
import {ModulesData, Block} from '@imagina/qbuilder/_components/blocksPanel/interface'

interface ResponseBlock {
  data: Block[]
}


export default {
  createBlock(data: any, params = {}): Promise<Block> {
    return new Promise((resolve, reject) => {
      //Params
      let requestParams = {
        ...params
      }
      //Request
      baseService.create('apiRoutes.qbuilder.blocks', data, requestParams).then(response => {
        resolve(response.data)
      }).catch(error => reject(error))
    })
  }
}
