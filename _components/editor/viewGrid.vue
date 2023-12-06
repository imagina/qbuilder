<template>
  <div class="row">
    <section id="panel-editor-component" class="col-md-6">
      <draggable class="row q-col-gutter-md" v-model="localBlocks" group="components" @end="updateSortOrder">
        <div :class="element.grid_position" v-for="element in localBlocks" :key="element.id">
          <div class="panel-editor-component__component">{{ element.name }}</div>
          <button @click="addBlock(element)">Añade un bloque</button>
        </div>
      </draggable>
    </section>
    <pre class="col-md-6">{{ localBlocks }}</pre>
  </div>
</template>
<script>
import draggable from 'vuedraggable'
export default {
  name: "Panel",
  props: {
    blocks: {
      type: Array,
      default: []
    }
  },
  components: {
    draggable
  },
  data() {
    return {
      localBlocks: this.blocks
    }
  },
  watch: {},
  computed: {},
  methods: {
    updateSortOrder() {
      // Update sort_order based on the new position in the array
      this.localBlocks.forEach((block, index) => {
        block.sort_order = index + 1;
      });

      // Emit an event to notify the parent component about the change
      this.$emit('update-blocks', this.localBlocks);
    },
    addBlock(siuu) {
      console.log(siuu)
    }
  }
}
</script>
<style lang="stylus">
#panel-editor-component
  margin: 0 auto;
  min-height: 300px;
  width: 500px;
  background-color: white;
  border-radius: 10px;
  border: 1px solid #ccc;

  .panel-editor-component__component
    user-select: none;
    cursor: pointer;
    height: 100px;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 3px dotted black;
</style>