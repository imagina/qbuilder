<template>
  <div ref="pageBuilderEditor" id="pageBuilderEditor" class="bg-blue-grey-3">
    <div class="editor-options drawer-title" v-if="false">
      <q-btn-toggle v-if="createMode || selectedBlock" v-model="device"
                      class="my-custom-toggle" no-caps rounded unelevated toggle-color="green" color="grey-3"
                      text-color="green" :options="deviceOptions"/>
      <div></div>
      <q-btn color="primary" text-color="white" no-caps v-if="selectedBlock" @click="() => saveBlockInfo()" label="Guardar" />
      <q-btn color="primary" text-color="white" no-caps v-else-if="createMode" @click="() => $eventBus.$emit('saveBlockInfo')" label="Guardar Bloque" />
      <q-btn color="primary" text-color="white" no-caps v-else-if="!selectedBlock && !createMode" @click="() => saveBlockInfo()" label="Crear Bloque" />
    </div>
    <div id="editorContent">
      <!--Block Preview-->
      <div class="text-center text-white bg-green" v-if="false">
        {{device ? 'Desktop': 'Mobile'}}
      </div>
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
      device: editorStore.models.device,
      createMode: computed(() => editorStore.state.createMode),
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
  mounted() {
    this.$nextTick(() => {
      //this.$refs['form-editor'].submit();
      this.device = 1
    })
  },
  computed: {
    deviceOptions(){
      return [{label: 'Mobile', value: 0}, {label: 'Desktop', value: 1}]
    }
  },
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
<style lang="sass">
#pageBuilderEditor
  padding 34px 100px 34px 100px
  height 100vh
  width calc(100% - 500px)
  transform translateX(540px)

  .editor-options{
    width 100%
    display flex
    align-items center
    justify-content space-between
    background-color #5333ed
    padding 16px 24px 16px 24px
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
