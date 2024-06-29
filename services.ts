import baseService from '@imagina/qcrud/_services/baseService'
import store from '@imagina/qbuilder/store'
import {ModuleBlockConfig, ModulesData} from "@imagina/qbuilder/_components/blocksPanel/interface";

export default {
  //Get Config about Modules Block
  getModuleBlocks(refresh = false, params = {}): Promise<ModulesData> {
    return new Promise((resolve, reject) => {
      //Params
      let requestParams = {
        refresh,
        params
      }
      //Request
      baseService.index('apiRoutes.qsite.configs', requestParams).then(response => {
        resolve(response.data)
      }).catch(error => reject(error))
    })
  },
  getConfigBlocks: (config: ModulesData) => {
    //Map blockConfigs to get an array with all blocks
    const response: ModuleBlockConfig[] = []
    const blockConfigsByModule = Object.values(config).filter(item => item)
    blockConfigsByModule.forEach(configModule =>
    {
      Object.values(configModule).forEach(blockConfig =>
      {
        //Added blockConfig to all configs like child
        if (blockConfig.systemName !== 'x-ibuilder::block')
        {
          blockConfig.childBlocks = {
            mainblock: 'x-ibuilder::block',
            ...(blockConfig.childBlocks || {})
          }
        }
        //Save data of modules
        response.push(blockConfig)
      })
    })

    store.blockConfigs = response
    return response
  },
  //Update block
  updateBlock(blockId, data, params = {}): Promise<any> {
    return new Promise((resolve, reject) => {
      const requestParams = {
        ...params,
        notToSnakeCase: [...(store.ignoreConfigKeys), "component", "entity", "attributes"]
      }
      delete data.children;

      baseService.update('apiRoutes.qbuilder.blocks', blockId, data, requestParams).then(response => {
        resolve(response.data)
      }).catch(error => reject(error))
    })
  },
}