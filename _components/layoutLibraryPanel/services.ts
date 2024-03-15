import { Layout } from 'src/modules/qbuilder/_components/layoutList/interface';
import { store } from 'src/plugins/utils';
import axios from 'axios';

interface ResponseGetLayout {
  data: Layout[];
}


export default {
  getLayoutsLibrary(refresh = false, params = {}): Promise<Layout[]> {
    return new Promise((resolve, reject) => {
      const baseUrl = store.getSetting('ibuilder::blockTemplatesUrl');
      if (!baseUrl) return resolve([]);
      const requestParams = {
        refresh,
        params: {
          filter: { allTranslations: true },
          ...params
        }
      };

      //Request
      //@ts-ignore
      axios.get<ResponseGetLayout>(`${baseUrl}/api${config('apiRoutes.qbuilder.layouts')}`, requestParams).then((response: { data: ResponseGetLayout }) => {
        resolve(response.data.data);
      }).catch((error: any) => reject(error));
    });
  }
};
