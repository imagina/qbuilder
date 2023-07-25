<template>
  <div id="builderDrawerBlockList">
    <!--Title-->
    <div class="drawer-title">
      {{ $trp('ibuilder.cms.block') }}
      <q-input bottom-slots v-model="inputSearch" dark dense>
        <template v-slot:append>
          <q-icon v-if="inputSearch !== ''" name="close" @click="inputSearch = ''" class="cursor-pointer" />
          <q-icon name="search"></q-icon>
        </template>
      </q-input>
    </div>
    <!--List the blocks-->
    <q-scroll-area style="height: calc(100vh - 116px)">
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
        return this.blocks.filter((block) => block.internalTitle.toLowerCase().includes(this.inputSearch.toLowerCase()) )     
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
