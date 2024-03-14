import baseService from '@imagina/qcrud/_services/baseService'

export default {
  getLayouts(refresh = false, params = {}): Promise<any> {
    return new Promise((resolve, reject) => {
      const requestParams = {refresh, params}
      //Request
      baseService.index('apiRoutes.qbuilder.layouts', requestParams).then(response => {
        resolve({
          ...response,
          data: response.data.sort((a, b) => b.id - a.id).map(layout => ({
            ...layout,
            blocks: layout.blocks.map(block => ({
              ...block,
              entity: Array.isArray(block.entity) ? {} : block.entity,
              attributes: Array.isArray(block.attributes) ? {} : block.attributes
            }))
          }))
        })
      }).catch(error => reject(error))
    })
  }
}