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
    }
  }

  // Mounted
  onMounted(() => {})

  return {...refs, ...(toRefs(state)), ...computeds, ...methods}
}
