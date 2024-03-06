import baseService from '@imagina/qcrud/_services/baseService'
import {Layout} from '@imagina/qbuilder/_components/layoutPanel/interface'
import {getCurrentInstance} from "vue";

interface ResponseGetLayout {
  data: Layout[]
}


export default {
  getLayoutsLibrary(refresh = false, params = {}): Promise<Layout[]> {
    const proxy = getCurrentInstance()!.proxy
    return new Promise((resolve, reject) => {
      const baseUrl = proxy.$store.getters['qsiteApp/getSettingValueByName']('ibuilder::blockTemplatesUrl')
      if(!baseUrl) return resolve([])
      const requestParams = {
        filter: {allTranslations: true},
        refresh,
        ...params
      }

      //Request
      //@ts-ignore
      proxy.$axios.get<ResponseGetLayout>(`${baseUrl}/api${config('apiRoutes.qbuilder.layouts')}`, requestParams).then((response) => {
        resolve(response.data.data)
      }).catch(error => reject(error))
    })
  },
}
