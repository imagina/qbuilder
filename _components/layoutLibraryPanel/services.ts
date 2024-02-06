import baseService from '@imagina/qcrud/_services/baseService'
import {Layout} from '@imagina/qbuilder/_components/layoutPanel/interface'

interface ResponseGetLayout {
  data: Layout[]
}


export default {
  getLayoutsLibrary(refresh = false, params = {}): Promise<Layout[]> {
    return new Promise((resolve, reject) => {
      const requestParams = {refresh, params}

      //Request
      baseService.index<ResponseGetLayout>('apiRoutes.qbuilder.layouts', requestParams).then((response) => {
        resolve(response.data)
      }).catch(error => reject(error))
    })
  },
}
