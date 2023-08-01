<template>
	<div class="row q-pa-md bg-grey-2 fixed-bottom">
      <div class="col-12 text-center">      	
        <q-btn color="primary" text-color="white" no-caps rounded unelevated v-if="selectedBlock" @click="() => $eventBus.$emit('updateBlockInfo')" label="Guardar" />
        <q-btn color="primary" text-color="white" no-caps rounded unelevated v-else-if="createMode" @click="() => $eventBus.$emit('saveBlockInfo')" label="Guardar Bloque" />
       	<q-btn color="primary" text-color="white" no-caps rounded unelevated icon="fa-light fa-plus" v-else-if="!selectedBlock && !createMode" @click="() => editorStore.methods.createMode()" label="Crear Bloque" />
      </div>
    </div>
</template>
<script>
import Vue, {defineComponent, computed, ref} from "vue";
import editorStore from '@imagina/qbuilder/_store/editor'

export default defineComponent({
  name: 'saveButton',
  setup() {
    return {
      editorStore
    }
  },  
  computed: {
  	selectedBlock: () => editorStore.state.selectedBlock,
  	createMode: () => editorStore.state.createMode,
  }
})
</script>