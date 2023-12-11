import {computed, reactive, ref, onMounted, toRefs, watch, getCurrentInstance} from "vue";

export default function controller(props: any, emit: any) {
    const proxy = getCurrentInstance().proxy

    // Refs
    const refs = {
        // refKey: ref(defaultValue)
    }

    // States
    const state = reactive({
        localBlocks: props.blocks.sort((a, b) => a.sortOrder - b.sortOrder),
        testBlock: props.blocks.sort((a, b) => a.sortOrder - b.sortOrder).map(block => ({
            id: block.id,
            sortOrder: block.sortOrder,
            internalTitle: block.internalTitle,
            gridPosition: block.gridPosition,
            systemName: block.systemName
        }))
    })

    // Computed
    const computeds = {
        // key: computed(() => {})
    }

    // Methods
    const methods = {
        updateSortOrder() {
            // Update sort_order based on the new position in the array
            state.localBlocks.forEach((block, index) => {
                block.sortOrder = index + 1;
            });

            // Update sort_order based on the new position in the array
            state.testBlock.forEach((block, index) => {
                block.sortOrder = index + 1;
            });

            // Emit an event to notify the parent component about the change
            emit('update-blocks', state.localBlocks);
        },
        addBlock(siuu) {
            console.log(siuu, state.testBlock, state.localBlocks)
        }
    }

    // Mounted
    onMounted(() => {
    })

    // Watch
    // watch(key, (newField, oldField): void => {
    //
    // }, {deep: true})

    return {...refs, ...(toRefs(state)), ...computeds, ...methods}
}