import { computed, reactive, ref, onMounted, toRefs } from 'vue';
import storeEditor from 'src/modules/qbuilder/_pages/admin/editor/store';
import {
  ModuleBlockConfig,
  SelectContent,
  Block
} from 'src/modules/qbuilder/_components/blocksPanel/interface';
import dynamicForm from 'src/modules/qsite/_components/master/dynamicForm.vue';
import service from 'src/modules/qbuilder/_components/blockContentForm/services';
import { i18n, clone, store as globalStore, uid } from 'src/plugins/utils';

interface MainData extends Block {
  componentName: string;
}

interface StateProps {
  block: Block,
  idBlock: number | null,
  indexBlock: number,
  layoutId: number | null,
  parentSystemName: string | null,
  showModal: boolean,
  formBlock: MainData | null,
  configBlock: ModuleBlockConfig,
  languageOptions: any,
  loading: boolean
}


export default function controller(props: any, emit: any) {

  // Refs
  const refs = {
    refForm: ref<typeof dynamicForm>()
  };

  // States
  const state = reactive<StateProps>({
    block: {} as Block,
    idBlock: null,
    indexBlock: 1,
    layoutId: null,
    parentSystemName: null,
    showModal: false,
    formBlock: null,
    configBlock: {} as ModuleBlockConfig,
    languageOptions: globalStore.getters['qsiteApp/getSelectedLocalesSelect'],
    loading: false
  });

  // Computed
  const computeds = {
    //Map the info to dynamic form
    formFields: computed(() => {
      //Main Content about Block
      let blockForm: any[] = [
        {
          name: 'main',
          title: i18n.tr('ibuilder.cms.label.system'),
          fields: {
            internalTitle: {
              isTranslatable: true,
              type: 'input',
              required: true,
              colClass: 'col-12',
              props: {
                label: i18n.tr('isite.cms.form.title') + '*',
                rules: [
                  val => !!val || i18n.tr('isite.cms.message.fieldRequired')
                ]
              }
            },
            systemName: {
              type: 'select',
              required: true,
              fakeFieldName: 'component',
              colClass: 'col-12',
              props: {
                label: i18n.tr('isite.cms.label.block') + '*',
                options: Object.values(storeEditor.blockConfigs).filter(item => !item.internal).map(item => {
                  return { label: item.title, value: item.systemName };
                }),
                readonly: true
              }
            },
            status: {
              value: '1',
              type: 'select',
              colClass: 'col-6',
              required: true,
              props: {
                label: `${i18n.tr('isite.cms.form.status')} *`,
                options: [
                  { label: i18n.tr('isite.cms.label.enabled'), value: '1' },
                  { label: i18n.tr('isite.cms.label.disabled'), value: '0' }
                ]
              }
            },
            withContentEditable: {
              value: '0',
              type: 'select',
              colClass: 'col-6',
              required: true,
              props: {
                label: `With Content Editable`,
                options: [
                  { label: i18n.tr('isite.cms.label.yes'), value: '1' },
                  { label: i18n.tr('isite.cms.label.no'), value: '0' }
                ]
              }
            },
            mediasSingle: {
              value: {},
              type: 'media',
              colClass: 'col-12',
              fieldItemId: state.idBlock || null,
              props: {
                label: i18n.tr('isite.cms.message.preview'),
                zone: 'internalimage',
                entity: 'Modules\\Ibuilder\\Entities\\Block',
                entityId: null
              }
            }
          }
        }
      ];

      //instance the selected block
      const block: ModuleBlockConfig = state.configBlock || {} as ModuleBlockConfig;

      //Entity Form
      if (block.content?.length) blockForm.push(methods.getEntityForm());

      return blockForm;
    }),
    //get body params to iframe
    getBlockRequestData: computed(() => {
      // Determine which object to use as base
      const baseObject = state.idBlock ? { ...state.block, ...state.formBlock } : state.formBlock;

      // Clone the base object
      let response: any = clone({
        ...baseObject,
        ...(state.idBlock ? {} : {
          systemName: uid(),
          attributes: { ...(state.block?.attributes ?? {}) }
        })
      });

      if (!!state.layoutId) {
        response.layouts = {};
        response.layouts[state.layoutId] = {
          systemName: uid(),
          gridPosition: 'col-md-12',
          sortOrder: state.indexBlock,
          parentSystemName: state.parentSystemName ?? null
        };
      }

      if (!response.entity) response.entity = {};

      //Merge translations
      state.languageOptions.forEach(lang => {
        const locale = lang.value;
        const formLocaleData = state.formBlock ?? {};
        response[locale] = {
          ...state.block[locale],
          ...(formLocaleData[locale] ?? {})
        };

        response = {
          ...response,
          ...(formLocaleData[locale] ?? {})
        };
      });

      //Remove extra data
      delete response.helpText;
      //Response
      return response;
    }),
    //get modal Actions
    modalActions: computed(() => {
      const buttonLabel = state.idBlock ? i18n.tr('isite.cms.label.update') : i18n.tr('isite.cms.label.save');
      return [
        {
          props: {
            label: buttonLabel,
            color: 'green'
          },
          action: () => refs.refForm.value?.changeStep('next', true)
        }
      ];
    })

  };

  // Methods
  const methods = {
    //Fill in data for creation with selected block
    fillData(selectedBlock, { index, layoutId, parentSystemName }) {
      // Cloning and setting selected block data
      state.block = clone(selectedBlock);
      state.indexBlock = clone(index);
      state.layoutId = clone(layoutId);
      state.parentSystemName = clone(parentSystemName);

      // Cloning and setting form block data
      state.formBlock = clone(selectedBlock);

      // Retrieving and setting block configuration
      state.configBlock = methods.getBlockConfig(selectedBlock.component?.systemName);

      // Displaying the modal
      state.showModal = true;
    },
    //Fill in data for update with selected block
    updateData(selectedBlock) {
      // Cloning and setting selected block data
      state.block = clone(selectedBlock);
      //Get Block id to Update
      state.idBlock = clone(selectedBlock.id);
      //Get data to pass to Form
      state.formBlock = clone(selectedBlock);

      //Search the selected block configuration
      state.configBlock = methods.getBlockConfig(selectedBlock.component?.systemName);

      state.showModal = true;
    },
    //Load content options
    loadOptionsContent() {
      let response: SelectContent | null = null;

      //Check if there is a configuration block in the state
      if (state.configBlock?.content) {
        // Find the element that matches the given entity type
        response = state.configBlock.content.find(item => {
          if (item.value == state.formBlock?.entity?.type) return item;
        })!;
      }

      // Return load options if they exist
      return response?.loadOptions || null;
    },
    //Find Config about Block
    getBlockConfig(systemName: string) {
      return storeEditor.blockConfigs?.find(
        block => block?.systemName === systemName
      ) ?? {} as ModuleBlockConfig;
    },
    //Get EntityForm
    getEntityForm() {
      const entityData = state.formBlock?.entity;
      //Get loadOptions if has Content
      const loadOptions = methods.loadOptionsContent();

      //Return structure of Form
      return {
        title: i18n.tr('isite.cms.label.entity'),
        fields: {
          helpText: {
            type: 'banner',
            colClass: 'col-12',
            props: {
              message: 'Configura aquí el contenido del componente...'
            }
          },
          useViewParams: {
            type: 'select',
            require: true,
            colClass: 'col-12',
            fakeFieldName: 'entity',
            vIf: state.configBlock.useViewParams ? true : false,
            props: {
              label: `${i18n.tr('ibuilder.cms.useViewParams')}*`,
              rules: [
                val => !!val || i18n.tr('isite.cms.message.fieldRequired')
              ],
              options: [
                {label: i18n.tr('isite.cms.label.yes'), value: '1'},
                {label: i18n.tr('isite.cms.label.no'), value: '0'}
              ]
            }
          },
          type: {
            type: 'select',
            require: true,
            colClass: 'col-12',
            fakeFieldName: 'entity',
            props: {
              label: `${i18n.tr('isite.cms.label.entity')}*`,
              rules: [
                val => !!val || i18n.tr('isite.cms.message.fieldRequired')
              ],
              options: state.configBlock?.content || []
            }
          },
          id: {
            type: 'select',
            require: true,
            fakeFieldName: 'entity',
            colClass: 'col-12',
            vIf: !!loadOptions,
            props: {
              label: `${i18n.tr('isite.cms.label.record')}*`,
              rules: [
                val => !!val || i18n.tr('isite.cms.message.fieldRequired')
              ]
            },
            loadOptions: loadOptions
          },
          params: {
            type: 'json',
            require: true,
            colClass: 'col-12',
            fakeFieldName: 'entity',
            vIf: (entityData?.type && !!!loadOptions) ? true : false,
            props: {
              label: i18n.tr('isite.cms.label.filter'),
              rules: [
                val => !!val || i18n.tr('isite.cms.message.fieldRequired')
              ]
            }
          }
        }
      };
    },
    //Save data
    async submitData() {
      const requestData = computeds.getBlockRequestData.value;
      const keysNotToSnakeCase = [...(Object.keys(requestData.attributes) ?? []), ...(storeEditor.ignoreConfigKeys ?? []), 'component', 'entity', 'attributes'];
      //Request params
      const requestParams = { notToSnakeCase: keysNotToSnakeCase };

      if (state.idBlock) {
        state.showModal = false;
        state.idBlock = null;
        emit('updated', requestData);
      } else await methods.createBlock(requestData, requestParams);
    },
    //Create Block
    async createBlock(data, params) {
      state.loading = true;

      service.createBlock(data, params).then(response => {
        state.loading = false;
        state.showModal = false;
        data.id = response.id;

        if (!!state.layoutId) {
          const pivotData = response.layouts[0]?.blocks?.find(block => block.id == response.id);

          if (pivotData) {
            data.pivot = pivotData.pivot;
          }

          delete data.layouts;
        }

        emit('created', data);
      }).catch(error => {
        state.loading = false;
      });
    }
  };

  // Mounted
  onMounted(() => {
  });

  // Watch
  // watch(key, (newField, oldField): void => {
  //
  // }, {deep: true})

  return { ...refs, ...(toRefs(state)), ...computeds, ...methods };
}
