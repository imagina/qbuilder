import baseService from 'src/modules/qcrud/_services/baseService';
import { Block } from 'src/modules/qbuilder/_components/blocksPanel/interface';

export default {
  getOneBlock(refresh = false, criteria, params = {}): Promise<Block> {
    return new Promise((resolve, reject) => {
      //Params
      let requestParams = {
        refresh: refresh,
        params: {
          filter: { allTranslations: true },
          include: 'fields,files',
          ...params
        }
      };
      //Request
      baseService.show('apiRoutes.qbuilder.blocks', criteria, requestParams).then(response => {
        resolve(response.data);
      }).catch(error => reject(error));
    });
  }
};
