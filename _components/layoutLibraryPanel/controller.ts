import Vue, {computed, reactive, ref, onMounted, toRefs, watch, getCurrentInstance} from "vue";
import service from '@imagina/qbuilder/_components/layoutLibraryPanel/services'
import {Layout} from '@imagina/qbuilder/_components/layoutPanel/interface'

interface StateProps {
  layoutLibrary: Layout[],
  layoutTypeSelected: string | null,
  loading: Boolean,
}

export default function controller(props: any, emit: any) {
  const proxy = (getCurrentInstance() as { proxy: Vue }).proxy as Vue

  // Refs
  const refs = {}

  // States
  const state = reactive<StateProps>({
    layoutLibrary: [],
    layoutTypeSelected: null,
    loading: false
  })

  // Computed
  const computeds = {
    //Return the existing blocks to list
    layoutTypes: computed(() => {
      const configs = methods.builderConfig()
      const response= [];

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
      const newLayout = proxy.$clone(layout)
      newLayout.systemName = proxy.$uid();

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
