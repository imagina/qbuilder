<template>
  <div class="row">
    <section id="panel-editor-component" class="full-width">
      <draggable class="row q-col-gutter-md" v-model="orderedItems" group="components" @update="updateSortOrder">
        <div :class="element.gridPosition" v-for="element in orderedItems" :key="element.id">
          <div class="panel-editor-component__component">{{ element.internalTitle }}</div>
          <button @click="addBlock(element)">Añade un bloque</button>
        </div>
      </draggable>
    </section>
  </div>
</template>
<script>
import {defineComponent} from 'vue'
import controller from "@imagina/qbuilder/_components/handleGrid/controller";
//components
import draggable from 'vuedraggable'

export default defineComponent({
  name: "Panel",
  props: {
    value: {
      type: Array,
      default: []
    },
    orderBy: {
      type: String,
      default: null
    }
  },
  components: {
    draggable
  },
  setup(props, {emit}) {
    return {...controller(props, emit)}
  }
})
</script>
<style lang="stylus">
#panel-editor-component
  margin: 0 auto;
  padding 10px
  min-height: 80vh;
  background-color: white;
  border-radius: 10px;
  //border: 1px solid #ccc;

  .panel-editor-component__component
    user-select: none;
    cursor: pointer;
    height: 100px;
    display: flex;
    align-items: center;
    justify-content: center;
    border: dashed 3px $blue-grey;
</style>
