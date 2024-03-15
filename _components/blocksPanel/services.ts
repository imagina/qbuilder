import baseService from 'src/modules/qcrud/_services/baseService';
import { Block } from 'src/modules/qbuilder/_components/blocksPanel/interface';
import { store } from 'src/plugins/utils';
import axios from 'axios';

interface ResponseBlock {
  data: Block[];
}


export default {
  getLocalBlocks(refresh = false, params = {}): Promise<Block[]> {
    return new Promise((resolve, reject) => {
      //Params
      let requestParams = {
        refresh,
        params: {
          filter: { allTranslations: true },
          include: 'fields,files',
          ...params
        }
      };
      //Request
      baseService.index('apiRoutes.qbuilder.blocks', requestParams).then(response => {
        resolve(response.data);
      }).catch(error => reject(error));
    });
  },
  getBlockLibrary(refresh = false, params = {}): Promise<Block[]> {
    return new Promise((resolve, reject) => {
      const baseUrl = store.getSetting('ibuilder::blockTemplatesUrl');
      if (!baseUrl) return resolve([]);
      let requestParams = {
        params: {
          refresh,
          filter: { allTranslations: true },
          include: 'fields,files',
          ...params
        }
      };

      //Request
      //@ts-ignore
      axios.get<ResponseBlock>(`${baseUrl}/api${config('apiRoutes.qbuilder.blocks')}`, requestParams).then((response: { data: ResponseBlock}) => {
        resolve(response.data.data);
      }).catch((error: any) => reject(error));
    });
  },
  createLayoutBlock(data: any, params = {}): Promise<Block> {
    return new Promise((resolve, reject) => {
      //Params
      let requestParams = {
        ...params
      };
      //Request
      baseService.create('apiRoutes.qbuilder.layoutBlocks', data, requestParams).then(response => {
        resolve(response.data);
      }).catch(error => reject(error));
    });
  }
};
