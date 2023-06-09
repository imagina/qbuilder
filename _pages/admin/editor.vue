<template>
  <div ref="pageBuilderEditor" id="pageBuilderEditor" class="bg-blue-grey-3">
    <div class="editor-options drawer-title">
      <select v-if="selectedBlock">
        <option value="1" selected>Escritorio</option>
        <option value="2">Movíl</option>
      </select>
      <div v-else></div>
      <q-btn color="white" text-color="primary" v-if="selectedBlock" class="editor-options-save" @click="() => saveBlockInfo()">Guardar</q-btn>
      <q-btn color="white" text-color="primary" v-else class="editor-options-create primary" @click="() => saveBlockInfo()">Crear Bloque</q-btn>
    </div>
    <div id="editorContent" class="bg-white shadow-7">
      <!--Block Preview-->
      <block-preview />
    </div>
  </div>
</template>
<script>
import Vue, {defineComponent, computed} from "vue";
import editorStore from '@imagina/qbuilder/_store/editor'
import blockPreview from '@imagina/qbuilder/_components/editor/blockPreview.vue'

export default defineComponent({
  setup() {
    return {
      blocks: computed(() => editorStore.state.blocks),
      selectedBlock: computed(() => editorStore.state.selectedBlock),
      loading: computed(() => editorStore.state.loading),
    }
  },
  name: "Editor",
  props: {},
  components: {blockPreview},
  data() {
    return {
      urlIframe: 'https://www.imaginacolombia.com'
    }
  },
  watch: {
    
  },
  mounted() {
    this.$nextTick(() => {
      //this.$refs['form-editor'].submit();
    })
  },
  computed: {},
  methods: {
    saveBlockInfo(){
      if (this.selectedBlock) {
        this.$eventBus.$emit('updateBlockInfo');
      }else{
        editorStore.methods.createMode();
        //this.$eventBus.$emit('saveBlockInfo');
      }
    }
  }
})
</script>
<style lang="stylus">
#pageBuilderEditor
  padding 0px 100px 50px 100px
  height 100vh
  width calc(100% - 500px)
  transform translateX(500px)

  .editor-options{
    width 100%
    height 60px
    display flex
    align-items center
    justify-content space-between
    background-color #5333ed
    padding 0 50px
  }

  .editor-options-save, .editor-options-create{
      
  }

  #editorContent
    width 100%
    height 100%

  #frameContent
    width: 100%
    height: calc(100vh - 100px)

    iframe
      min-width 100%
      min-height 100%
</style>
