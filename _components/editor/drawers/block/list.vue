<template>
  <div id="builderDrawerBlockList">
    <!--Title-->
    <div class="row drawer-title" style="padding: 14px 24px;">
      <div class="col-4">
        {{ $trp('ibuilder.cms.block') }}
      </div>
      <div class="col-8 text-center">
        <q-input v-model="inputSearch" autofocus dense dark standout style="padding-bottom: 0px">
          <template v-slot:append>
            <q-icon v-if="inputSearch !== ''" name="close" @click="inputSearch = ''" class="cursor-pointer" color="primary"/>
            <q-icon v-if="inputSearch == ''" name="search" color="primary"></q-icon>
          </template>
        </q-input>
      </div>
    </div>
    <!--List the blocks-->
    <q-scroll-area style="height: calc(100vh - 136px)">
      <div class="padding-drawer-content">
        <div class="row q-gutter-y-md">
          <div v-for="(block, blockKey) in filteredBlocks" :key="blockKey" @click="setSelectedBlock(block)"
               class="col-12 builder_block hover-effect-border"  v-bind:id="`block_${block.id}`"  ref="blocks" >
            <!--Image-->
            <div class="builder_block__image img-as-bg"
                 :style="`background-image: url('${block.mediaFiles.internalimage.mediumThumb}')`"></div>
            <!--Title-->
            <div class="builder_block__title text-white q-pa-sm">
              {{ block.internalTitle }} ({{ block.systemName }})
              <br>
              {{block.component.systemName}}
            </div>
          </div>
        </div>
      </div>
    </q-scroll-area>
    <div class="row q-pa-md bg-grey-2">
      <div class="col-12 text-center">
        <q-btn color="primary" text-color="white" no-caps rounded unelevated icon="fa-light fa-plus" @click="() => editorStore.methods.createMode()" label="Crear Bloque" />
      </div>
    </div>
  </div>
</template>
<script>
import Vue, {defineComponent, computed, ref} from "vue";
import editorStore from '@imagina/qbuilder/_store/editor'

export default defineComponent({
  setup() {
    let inputSearch = ref("")

    return {
      blocks: computed(() => editorStore.state.blocks),
      setSelectedBlock: editorStore.methods.setSelectedBlock,
      editorStore,
      inputSearch
    }
  },
  beforeDestroy() {
    this.$root.$off('page.data.refresh')
  },
  props: {},
  components: {},
  watch: {
    blocks(oldBlocks, newBlocks){
      this.openLastSelectedBlock();
    }
  },
  mounted() {
    this.$nextTick(function () {
      this.init()
    })
  },
  data() {
    return {
      loading: false,
      data: []
    }
  },
  computed: {
    filteredBlocks(){
      if(this.inputSearch){
        let text = this.inputSearch.toLowerCase()
        return this.blocks.filter((block) => {
          return block.internalTitle.toLowerCase().includes(text) ||
                 block.systemName.toLowerCase().includes(text) ||
                 block.component.systemName.toLowerCase().includes(text)
        } )
      }        
      return this.blocks
    }
  },
  methods: {
    init() {
      editorStore.methods.getBlocksData(true)
    },
    openLastSelectedBlock(){
      const lastSelectedBlockId = editorStore.getLastSelectedBlock();
      if (lastSelectedBlockId){
        setTimeout(() => {
          this.$refs.blocks.find((el) => el.id == 'block_'+lastSelectedBlockId).click()
          //document.getElementById("block_"+lastSelectedBlockId).click()
        }, 500);
      }
    }
  }
})
</script>
<style lang="stylus">
#builderDrawerBlockList
  .builder_block
    position relative

    &__image
      width 100%
      height 150px

    &__title
      position absolute
      bottom 0
      width 100%
      background-color rgba($grey-9, 0.5)

</style>
