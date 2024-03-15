import baseService from 'src/modules/qcrud/_services/baseService';
import { Block } from 'src/modules/qbuilder/_components/blocksPanel/interface';

export default {
  createBlock(data: any, params = {}): Promise<Block> {
    return new Promise((resolve, reject) => {
      //Params
      let requestParams = {
        ...params
      };
      //Request
      baseService.create('apiRoutes.qbuilder.blocks', data, requestParams).then(response => {
        resolve(response.data);
      }).catch(error => reject(error));
    });
  }
};
