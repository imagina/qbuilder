import {getCurrentInstance} from "vue"
import baseService from '@imagina/qcrud/_services/baseService'

export default {
  getLocalBlocks(refresh = false, params = {}): Promise<any> {
    return new Promise((resolve, reject) => {
      //Params
      let requestParams = {
        refresh: refresh,
        params: {
          filter: {allTranslations: true, ...params}
        }
      }
      //Request
      baseService.index('apiRoutes.qbuilder.blocks', requestParams).then(response => {
        resolve(response.data)
      }).catch(error => reject(error))
    })
  },
  getBlockLibrary(refresh = false, params = {}): Promise<any> {
    const proxy = getCurrentInstance()!.proxy
    return new Promise((resolve, reject) => {
      const baseUrl = proxy.$store.getters['qsiteApp/getSettingValueByName']('ibuilder::blockTemplatesUrl')
      if(!baseUrl) return resolve([])

      //Request
      proxy.$axios.get(`${baseUrl}/api${config('apiRoutes.qbuilder.blocks')}`).then(response => {
        resolve(response.data.data)
      }).catch(error => reject(error))
    })
  }
}
