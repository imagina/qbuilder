import baseService from '@imagina/qcrud/_services/baseService'
import {ModulesData} from "@imagina/qbuilder/_components/blocksPanel/interface";
import store from "@imagina/qbuilder/_pages/admin/editor/store";

export default {
  getBlockConfigs(refresh = false, params = {}): Promise<any> {
    return new Promise((resolve, reject) => {
      const requestParams = {refresh, params}
      //Request
      baseService.index('apiRoutes.qbuilder.layouts', requestParams).then(response => {
        resolve({
          ...response,
          data: response.data.sort((a, b) => b.id - a.id)
        })
      }).catch(error => reject(error))
    })
  },
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
  //Bulk update blocks
  blocksBulkUpdate(blocks, ignoreKeyToSnakeCase: string[] = []): Promise<any> {
    return new Promise((resolve, reject) => {
      //Request params
      const requestParams = {
        notToSnakeCase: [...ignoreKeyToSnakeCase,"component", "entity", "attributes"]
      }
      //Request
      baseService.update('apiRoutes.qbuilder.blocks', 'bulk/update', blocks, requestParams).then(response => {
        resolve(true)
      }).catch(error => reject(error))
    })
  },
  //Bulk create blocks
  blocksBulkCreate(blocks, ignoreKeyToSnakeCase: string[] = []): Promise<any> {
    return new Promise((resolve, reject) => {
      //Request params
      const requestParams = {
        notToSnakeCase: [...ignoreKeyToSnakeCase,"component", "entity", "attributes"]
      }
      //Request
      //@ts-ignore
      baseService.create(`${config('apiRoutes.qbuilder.blocks')}/bulk/create`, blocks, requestParams).then(response => {
        resolve(true)
      }).catch(error => reject(error))
    })
  },
  //Delete block
  deleteblock(blockId): Promise<any> {
    return new Promise((resolve, reject) => {
      baseService.delete('apiRoutes.qbuilder.blocks', blockId).then(response => {
        resolve(true)
      }).catch(error => reject(error))
    })
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
  //Bulk update pivot layout blocks
  layoutBlocksBulkUpdate(layoutBlocks, requestParams = {}): Promise<any> {
    return new Promise((resolve, reject) => {
      //Request
      baseService.update('apiRoutes.qbuilder.layoutBlocks', 'bulk/update', layoutBlocks, requestParams).then(response => {
        resolve(true)
      }).catch(error => reject(error))
    })
  },
  //Delete Relation block
  deleteRelationblock(id, requestParams = {}): Promise<any> {
    return new Promise((resolve, reject) => {
      baseService.delete('apiRoutes.qbuilder.layoutBlocks', id, requestParams).then(response => {
        resolve(true)
      }).catch(error => reject(error))
    })
  },
}
