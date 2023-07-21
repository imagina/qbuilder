<template>
  <div id="builderDrawerBlockList">
    <!--Title-->
    <div class="drawer-title">
      {{ $trp('ibuilder.cms.block') }}
    </div>
    <!--List the blocks-->
    <q-scroll-area style="height: calc(100vh - 60px)">
      <div class="padding-drawer-content">
        <div class="row q-gutter-y-md">
          <div v-for="(block, blockKey) in blocks" :key="blockKey" @click="setSelectedBlock(block)"
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
import Vue, {defineComponent, computed} from "vue";
import editorStore from '@imagina/qbuilder/_store/editor'

export default defineComponent({
  setup() {
    return {
      blocks: computed(() => editorStore.state.blocks),
      setSelectedBlock: editorStore.methods.setSelectedBlock
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
  computed: {},
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
