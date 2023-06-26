import Vue, {reactive, computed} from 'vue';
import crud from '@imagina/qcrud/_services/baseService.js';
import helper from '@imagina/qsite/_plugins/helper'

//States
const state = reactive({
  loading: false,
  drawers: {
    blocksList: false,
    blocksShow: false,
    blockAttributes: false,
  },
  blocks: [],
  blocksConfiguration: [],
  selectedBlock: null,
  formMainFields: {},
  formEntityFields: {},
  formExtraFields: {},
  formAttributesFields: {},
  statusChildBlocks: {},
  elementSelected: null,
  attributesKeyTemplate: Vue.prototype.$uid(),
  device: 1,
  formMobileAttributesFields: {},
  createMode: false,
  blockConfig: {},
})

//Model to be able use state as v-model
const models = {
  blocksConfiguration: computed({
    get: () => {
      const response = Object.values(state.blocksConfiguration)
        .filter(item => item)
        .reduce((acc, curr) => Object.assign(acc, curr), {});

      const mappedResponse = Object.values(response).map((block) => ({
        ...block,
        content: block.content || [],
        attributes: Object.values(block.attributes).map((item, index) => ({...item, name: index}))
      }));

      mappedResponse.forEach(block => {
        const blockElements = [
          {
            name: "componentAttributes",
            systemName: block.systemName,
            title: block.title,
            attributes: block.attributes
          }
        ];

        let childBlocks = block.childBlocks || {};
        if ((block.systemName !== "x-ibuilder::block") && !childBlocks.mainBlock) {
          childBlocks = { mainBlock: "x-ibuilder::block", ...childBlocks };
        }

        Object.keys(childBlocks).forEach(childName => {
          const childBlock = mappedResponse.find(item => item.systemName === childBlocks[childName]);
          if (childBlock) {
            blockElements.push({
              name: childName,
              systemName: childBlocks[childName],
              title: childBlock.title,
              attributes: childBlock.attributes
            });
          }
        });

        block.elements = blockElements;
      });

      return mappedResponse;
    },
    set: (val) => state.blocksConfiguration = val
  }),
  blocks: computed({
    get: () => state.blocks,
    set: (val) => state.blocks = val
  }),
  formMainFields: computed({
    get: () => state.formMainFields,
    set: (val) => state.formMainFields = val
  }),
  formEntityFields: computed({
    get: () => state.formEntityFields,
    set: (val) => state.formEntityFields = val
  }),
  formExtraFields: computed({
    get: () => state.formExtraFields,
    set: (val) => state.formExtraFields = val
  }),
  formAttributesFields: computed({
    get: () => state.formAttributesFields,
    set: (val) => state.formAttributesFields = val
  }),
  statusChildBlocks: computed({
    get: () => state.statusChildBlocks,
    set: (val) => state.statusChildBlocks = val
  }),
  elementSelected: computed({
    get: () => state.elementSelected,
    set: (val) => state.elementSelected = val
  }),
  device: computed({
    get: () => state.device,
    set: (val) => state.device = val
  }),
  formMobileAttributesFields: computed({
    get: () => state.formMobileAttributesFields,
    set: (val) => state.formMobileAttributesFields = val
  }),
  blockConfig: computed({
    get: () => state.blockConfig,
    set: (val) => state.blockConfig = val
  }),
}

//Getters
const getters = {
  //Data to show the block preview
  
  dataBlockPreview: computed(() => {
    //Instance the attributes
    const component = {
      nameSpace: state.blockConfig.nameSpace,
      systemName: state.formMainFields.componentName
    }
    const entity = state.formEntityFields
    let attributes
    if (Object.keys(state.formAttributesFields).length > 0 && Object.keys(state.formMobileAttributesFields)) {
      if (state.device === 0) {
        attributes = {
          ...state.formMobileAttributesFields,
          componentAttributes: {
            ...state.formMobileAttributesFields.componentAttributes,
            ...state.formExtraFields['es'] || {},
            //Merge all the fields into the componentAttributes
            ...((state.formExtraFields.content || []).map(item => ({[helper.snakeToCamelCase(item.name)]: item.value}))
              .reduce((result, current) => Object.assign(result, current), {}))
          }
        }
      }else{
        attributes = {
          ...state.formAttributesFields,
          componentAttributes: {
            ...state.formAttributesFields.componentAttributes,
            ...state.formExtraFields['es'] || {},
            //Merge all the fields into the componentAttributes
            ...((state.formExtraFields.content || []).map(item => ({[helper.snakeToCamelCase(item.name)]: item.value}))
              .reduce((result, current) => Object.assign(result, current), {}))
          }
        }
      }
    }else{
      const blockAttributes = state.blocks.find(block => block.component.systemName === state.blockConfig.systemName).attributes || []; 
      attributes = {
        ...blockAttributes,
        componentAttributes: {
          ...blockAttributes.componentAttributes,
          ...state.formExtraFields['es'] || {},
          //Merge all the fields into the componentAttributes
          ...((state.formExtraFields.content || []).map(item => ({[helper.snakeToCamelCase(item.name)]: item.value}))
            .reduce((result, current) => Object.assign(result, current), {}))
        }
      }
    }
    //Return
    console.log({component, entity, attributes});
    if (attributes.mainBlock) {
      attributes.mainblock = {...attributes.mainBlock};
      delete attributes.mainBlock;
    }
    return {component, entity, attributes}
  }),
}

//Getters
// const getters = {
//   //Data to show the block preview
//   dataBlockPreview: computed(() => {
//     //Instance the attributes
//     const component = state.selectedBlock.component
//     const entity = state.selectedBlock.entity
//     const attributes = {
//       ...state.selectedBlock.attributes,
//       componentAttributes: {
//         ...state.selectedBlock.attributes.componentAttributes,
//         //Merge all the fields into the componentAttributes
//         ...((state.selectedBlock.fields || []).map(item => ({[helper.snakeToCamelCase(item.name)]: item.value}))
//           .reduce((result, current) => Object.assign(result, current), {}))
//       }
//     }
//     //Return
//     return {component, entity, attributes}
//   })
// }

//Methods
const methods = {
  createMode(){
    state.drawers.blocksList = true;
    state.createMode = true;
    state.drawers.blocksShow = true;
    state.attributesKeyTemplate = Vue.prototype.$uid()
  },
  //Get blocks
  getBlocksData: (refresh = false) => {
    return new Promise((resolve, reject) => {
      state.loading = true
      //Requets params
      let requestParams = {
        refresh,
        params: {
          filter: {allTranslations: true},
          include: 'fields'
        }
      }
      //Request
      crud.index('apiRoutes.qbuilder.blocks', requestParams).then(response => {
        state.blocks = response.data
        console.log("mira aquí: ", response.data);
        state.drawers.blocksList = true
        state.loading = false
        resolve(response.data)
      }).catch(error => {
        state.loading = false
        resolve([])
      })
    })
  },
  //Get block configuration
  getBlocksConfiguration: (refresh = false) => {
    return new Promise((resolve, reject) => {
      state.loading = true
      //Params
      let requestParams = {
        refresh,
        params: {
          filter: {allTranslations: true, configNameByModule: 'blocks'}
        }
      }
      //Request
      crud.index('apiRoutes.qsite.configs', requestParams).then(response => {
        state.blocksConfiguration = response.data;
        state.loading = false
        resolve(response.data)
      }).catch(error => {
        state.loading = false
        resolve([])
      })
    })
  },
  //Set the selected block
  setSelectedBlock(block) {
    state.selectedBlock = block
    state.drawers.blocksShow = true
    state.attributesKeyTemplate = Vue.prototype.$uid()
  },
  //Finish Edit block
  closeBlockShow() {
    state.selectedBlock = null
    state.drawers.blocksShow = false
    state.createMode = false;
    state.formMainFields = {};
    state.formEntityFields = {};
    state.formExtraFields = {};
    state.formAttributesFields = {};
    state.formMobileAttributesFields = {};
  },
  setBlockFormData(){
    //Set only the main from data

    //Set only the entity form data
    //Set only the extraFields formdata
    //Set only the attributes from data
  },
  setElementSelected(elementSelected){
    state.elementSelected = elementSelected;
    state.drawers.blocksShow = false;
    state.drawers.blockAttributes = true;
  },

  closeAttributesDrawer(){
    
    state.drawers.blockAttributes = false;
    state.drawers.blocksShow = true;
  },
  setStatusChildBlock(element){
    state.statusChildBlocks[element] = true;
  },
  setBlockConfig(block){
    state.blockConfig = block;
  }
}

export default {
  state,
  models,
  getters,
  methods,
}
