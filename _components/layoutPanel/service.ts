import baseService from '@imagina/qcrud/_services/baseService'

export default {
  getLayouts(refresh = false, params = {}): Promise<any> {
    return new Promise((resolve, reject) => {
      const requestParams = {refresh, params}
      //Request
      baseService.index('apiRoutes.qbuilder.layouts', requestParams).then(response => {
        resolve(response)
      }).catch(error => reject(error))
    })
  }
}
