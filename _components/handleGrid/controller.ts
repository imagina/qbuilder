import {computed, reactive, ref, onMounted, toRefs, watch, getCurrentInstance} from "vue";

export default function controller(props: any, emit: any) {
  const proxy = getCurrentInstance().proxy

  // Refs
  const refs = {
    // refKey: ref(defaultValue)
  }

  // States
  const state = reactive({
    items: []
  })

  // Computed
  const computeds = {
    orderedItems: computed({
      get: () => {
        let tmpItems = props.value
        if (props.orderBy) {
          tmpItems.sort((a, b) => a[props.orderBy] - b[props.orderBy])
        }
        return tmpItems
      },
      set: (val) => state.items = val
    })
  }

  // Methods
  const methods = {
    updateSortOrder() {
      // Update sort_order based on the new position in the array
      const orderedItems = !props.orderBy ? state.items : state.items.map((item, index) => ({
        ...item,
        [props.orderBy]: index + 1
      }));
      // Emit an event to notify the parent component about the change
      emit('input', orderedItems);
    },
    addBlock(siuu) {
      console.log(siuu)
    }
  }

  // Mounted
  onMounted(() => {
  })

  // Watch
  // watch(() => props.value, (newField, oldField): void => {
  //   console.warn(">>>>>>>> Watch")
  //   state.items = computeds.orderedItems
  // }, {deep: true})

  return {...refs, ...(toRefs(state)), ...computeds, ...methods}
}
