import Vue, {computed, reactive, ref, onMounted, toRefs, watch, getCurrentInstance} from "vue";
import service from '@imagina/qbuilder/_components/dynamicFormAttributes/services'
import builderService from '@imagina/qbuilder/services'
import {Block} from '@imagina/qbuilder/_components/blocksPanel/interface'

interface StateProps {
  block: Block,
  formBlock: any,
  loading: boolean,
  show: boolean
}

export default function controller(props: any, emit: any) {
  const proxy = (getCurrentInstance() as { proxy: Vue }).proxy as Vue

  // Refs
  const refs = {}

  // States
  const state = reactive<StateProps>({
    block: {} as Block,
    show: false,
    formBlock: {},
    loading: false
  })

  // Computed
  const computeds = {
    modalProps: computed(() => {
      //Validate params props
      if (!state.show) return {}

      //Response
      return {
        title: (!props.idBlock) ? props.title : `${props.title} - ID: ${props.idBlock}`,
        width: 'max-content',
        loading: state.loading,
        actions: [
          {
            props: {
              color: 'green',
              label: (!props.idBlock) ? proxy.$tr('isite.cms.label.save') : proxy.$tr('isite.cms.label.update')
            },
            action: () => methods.updateBlock()
          }
        ]
      }
    })
  }

  // Methods
  const methods = {
    async getData() {
      if (props.idBlock && state.show) {
        state.loading = true
        try {
          //Get configs
          const block = await service.getOneBlock(true, props.idBlock)
          state.block = proxy.$clone(block)
          state.formBlock = proxy.$clone(block)
        } catch (error) {
          proxy.$apiResponse.handleError(error, () => {
            console.error("[Ibuilder Get Data]: ", error)
          })
        }

        state.loading = false
      }
    },
    //Update block
    updateBlock: () => {
      if (state.block) {
        state.loading = true
        const block = {
          ...state.block,
          ...state.formBlock
        }

        //Update block with editor service
        builderService.updateBlock(block.id, block).then(response => {
          proxy.$alert.info({message: proxy.$tr('isite.cms.message.recordUpdated')});
          //Emit info to Editor and Close Modal
          emit('update')
          methods.closeModal()
        }).catch(() => {
          proxy.$alert.error({message: proxy.$tr('isite.cms.message.recordNoUpdated')});
          state.loading = false
        })
      }
    },
    closeModal() {
      state.show = false
      state.block = {};
      state.formBlock = {};
      state.loading = false;
    },
  }

  // Mounted
  onMounted(() => {
  })

  watch(() => props.value, (newValue) => {
    state.show = proxy.$clone(newValue);
    methods.getData()
  })

  watch(() => state.show, (newValue) => {
    emit('input', newValue)
  })

  return {...refs, ...(toRefs(state)), ...computeds, ...methods}
}
