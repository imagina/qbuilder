import {computed, reactive, ref, onMounted, toRefs, getCurrentInstance} from "vue";

export default function layoutController(props: any, emit: any) {
  const proxy = getCurrentInstance()!.proxy
  // Refs
  const refs = {
    // key: ref(defaultValue)
  }

  // States
  const state = reactive({
    itemSelected: null
  })

  // Computed
  const computeds = {
    // key: computed(() => {})
  }

  // Methods
  const methods = {
    setItemSelected(itemSelected) {
      const item = proxy.$clone(itemSelected)
      emit('selected', {item, select: (val) => {state.itemSelected = val}})
    },
    createItem() {
      emit('create')
    },
    orderedItems() {
      const data = props.items;
      const type = props.collapseBy
      const response = {}

      for (const item of data) {
        const property = item[type]
        if(property) {
          if(response[property]) {
            response[property].push(item)
          } else {
            response[property] = [item]
          }
        }
      }

      return response
    }
  }

  // Mounted
  onMounted(() => {})

  return {...refs, ...(toRefs(state)), ...computeds, ...methods}
}
