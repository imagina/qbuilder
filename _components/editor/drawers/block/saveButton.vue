<template>
	<div class="row q-pa-md bg-grey-2 fixed-bottom">
      <div class="col-12 text-center">
        <q-btn :disable="this.disable" color="primary" text-color="white" no-caps rounded unelevated v-if="selectedBlock" @click="() => eventBus.emit('updateBlockInfo')" label="Guardar" />
        <q-btn :disable="this.disable" color="primary" text-color="white" no-caps rounded unelevated v-else-if="createMode" @click="() => eventBus.emit('saveBlockInfo')" label="Guardar Bloque" />
       	<q-btn color="primary" text-color="white" no-caps rounded unelevated icon="fa-light fa-plus" v-else-if="!selectedBlock && !createMode" @click="() => editorStore.methods.createMode()" label="Crear Bloque" />
      </div>
    </div>
</template>
<script>
import { defineComponent, computed, ref } from "vue";
import editorStore from 'modules/qbuilder/_store/editor'
import eventBus from 'modules/qsite/_plugins/eventBus'

export default defineComponent({
  name: 'saveButton',
  setup() {
    return {
      editorStore,
      eventBus
    }
  },
  computed: {
  	selectedBlock: () => editorStore.state.selectedBlock,
  	createMode: () => editorStore.state.createMode,
    disable: () => editorStore.state.drawers.disableSaveButton
  }
})
</script>
