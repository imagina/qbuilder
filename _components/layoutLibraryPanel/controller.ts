import Vue, {computed, reactive, ref, onMounted, toRefs, watch, getCurrentInstance} from "vue";
import service from '@imagina/qbuilder/_components/layoutLibraryPanel/services'
import {Layout} from '@imagina/qbuilder/_components/layoutPanel/interface'
import {Block} from '@imagina/qbuilder/_components/blocksPanel/interface'

interface StateProps {
  layoutLibrary: Layout[],
  layoutTypeSelected: string,
  loading: Boolean,
}

export default function controller(props: any, emit: any) {
  const proxy = (getCurrentInstance() as { proxy: Vue }).proxy as Vue

  // Refs
  const refs = {}

  // States
  const state = reactive<StateProps>({
    layoutLibrary: [],
    layoutTypeSelected: '',
    loading: false
  })

  // Computed
  const computeds = {
    //Return the existing blocks to list
    layoutTypes: computed(() => {
      const configs = methods.builderConfig()
      const response: {title: string, entityType: string}[] = [];

      // loop each module configs
      Object.keys(configs).forEach(moduleName => {
        // loop each module entity configs
        configs[moduleName].forEach(moduleEntityConfig => {
          // Include to response the layout by entities
          response.push({
            title: `${moduleEntityConfig.entity.label} (${moduleName})`,
            entityType: moduleEntityConfig.entity.value
          })
        })
      })
      // Response
      return response
    }),
    // return the blocks by selected type
    layoutsBySelectedType: computed(() => {
      return state.layoutLibrary.filter(layout => layout.entityType.includes(state.layoutTypeSelected))
    }),
  }

  // Methods
  const methods = {
    //Get principal data of the component
    getData: async () => {
      state.loading = true
      //Get all data of Layout Library
      state.layoutLibrary = await service.getLayoutsLibrary(true)
      //Set the default block type
      state.layoutTypeSelected = computeds.layoutTypes.value[0].entityType
      state.loading = false
    },
    //Get the configs from builder.layout
    builderConfig() {
      let config = proxy.$store.getters['qsiteApp/getConfigApp']('builder.layout', true)
      let response = {}

      //Filter only items with values
      Object.keys(config).forEach(moduleName => {
        if (config[moduleName]) response[moduleName] = config[moduleName]
      })
      return response
    },
    //Trigger to select Layout
    selectedLayout(layout) {
      let newLayout = {
        blocks: [] as Block[]
      } as Layout

      if(layout) {
        newLayout = proxy.$clone(layout)
        //@ts-ignore
        newLayout.systemName = proxy.$uid();
        delete newLayout.default;
        delete newLayout.id
      }

      emit('creating', newLayout);
    },
  }

  // Mounted
  onMounted(() => {
    methods.getData()
  })

  // Watch
  // watch(key, (newField, oldField): void => {
  //
  // }, {deep: true})

  return {...refs, ...(toRefs(state)), ...computeds, ...methods}
}
