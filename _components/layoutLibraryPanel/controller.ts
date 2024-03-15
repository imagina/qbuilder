import { computed, reactive, onMounted, toRefs } from 'vue';
import service from 'src/modules/qbuilder/_components/layoutLibraryPanel/services';
import { Layout } from 'src/modules/qbuilder/_components/layoutList/interface';
import { Block } from 'src/modules/qbuilder/_components/blocksPanel/interface';
import { clone, store as globalStore, uid } from 'src/plugins/utils';

interface StateProps {
  layoutLibrary: Layout[],
  layoutTypeSelected: string,
  loading: Boolean,
}

export default function controller(props: any, emit: any) {

  // Refs
  const refs = {};

  // States
  const state = reactive<StateProps>({
    layoutLibrary: [],
    layoutTypeSelected: '',
    loading: false
  });

  // Computed
  const computeds = {
    //Return the existing blocks to list
    layoutTypes: computed(() => {
      const configs = methods.builderConfig();
      const response: { title: string, entityType: string }[] = [];

      // loop each module configs
      Object.keys(configs).forEach(moduleName => {
        // loop each module entity configs
        configs[moduleName].forEach(moduleEntityConfig => {
          // Include to response the layout by entities
          response.push({
            title: `${moduleEntityConfig.entity.label} (${moduleName})`,
            entityType: moduleEntityConfig.entity.value
          });
        });
      });
      // Response
      return response;
    }),
    // return the blocks by selected type
    layoutsBySelectedType: computed(() => {
      return state.layoutLibrary.filter(layout => layout.entityType.includes(state.layoutTypeSelected));
    })
  };

  // Methods
  const methods = {
    //Get principal data of the component
    getData: async () => {
      state.loading = true;
      try {
        //Get all data of Layout Library
        state.layoutLibrary = await service.getLayoutsLibrary(true, { include: 'files' });
        //Set the default block type
        state.layoutTypeSelected = computeds.layoutTypes.value[0].entityType;
      } catch (e) {
        console.error('Failed Load Library: ', e);
      }


      state.loading = false;
    },
    //Get the configs from builder.layout
    builderConfig() {
      let config = globalStore.getters['qsiteApp/getConfigApp']('builder.layout', true);
      let response = {};

      //Filter only items with values
      Object.keys(config).forEach(moduleName => {
        if (config[moduleName]) response[moduleName] = config[moduleName];
      });
      return response;
    },
    //Trigger to select Layout
    selectedLayout(layout) {
      let newLayout = {
        blocks: [] as Block[]
      } as Layout;

      if (layout) {
        newLayout = clone(layout);
        //@ts-ignore
        newLayout.systemName = uid();
        delete newLayout.default;
        delete newLayout.id;
      }

      emit('creating', newLayout);
    }
  };

  // Mounted
  onMounted(() => {
    methods.getData();
  });

  return { ...refs, ...(toRefs(state)), ...computeds, ...methods };
}
