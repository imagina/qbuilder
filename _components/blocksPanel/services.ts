import {getCurrentInstance} from "vue"
import baseService from '@imagina/qcrud/_services/baseService'
import {ModulesData, Block} from '@imagina/qbuilder/_components/blocksPanel/interface'

interface ResponseBlock {
  data: Block[]
}


export default {
  getLocalBlocks(refresh = false, params = {}): Promise<Block[]> {
    return new Promise((resolve, reject) => {
      //Params
      let requestParams = {
        refresh,
        params: {
          filter: {allTranslations: true},
          include: 'fields,files',
          ...params
        }
      }
      //Request
      baseService.index('apiRoutes.qbuilder.blocks', requestParams).then(response => {
        resolve(response.data)
      }).catch(error => reject(error))
    })
  },
  getBlockLibrary(refresh = false, params = {}): Promise<Block[]> {
    const proxy = getCurrentInstance()!.proxy
    return new Promise((resolve, reject) => {
      const baseUrl = proxy.$store.getters['qsiteApp/getSettingValueByName']('ibuilder::blockTemplatesUrl')
      if(!baseUrl) return resolve([])
      let requestParams = {
        params: {
          filter: {allTranslations: true},
          include: 'fields,files',
          ...params
        }
      }

      //Request
      //@ts-ignore
      proxy.$axios.get<ResponseBlock>(`${baseUrl}/api${config('apiRoutes.qbuilder.blocks')}`, requestParams).then((response) => {
        resolve(response.data.data)
      }).catch(error => reject(error))
    })
  },
  createLayoutBlock(data: any, params = {}): Promise<Block> {
    return new Promise((resolve, reject) => {
      //Params
      let requestParams = {
        ...params
      }
      //Request
      baseService.create('apiRoutes.qbuilder.layoutBlocks', data, requestParams).then(response => {
        resolve(response.data)
      }).catch(error => reject(error))
    })
  }
}
