<template>
  <div id="builderDrawerBlocks">
    <!--Title-->
    <div class="bg-primary-builder q-py-md q-px-lg text-white text-subtitle1 row items-center">
      <q-icon name="fa-light fa-puzzle-piece" class="q-mr-sm" size="20px"/>
      {{ $trp('ibuilder.cms.block') }}
    </div>
    <!--List the blocks-->
    <q-scroll-area style="height: calc(100vh - 60px)">
      <div class="q-py-md q-px-lg">
        <div class="row q-gutter-y-md">
          <div v-for="(block, blockKey) in blocks" :key="blockKey" @click="setSelectedBlock(block)"
               class="col-12 builder_block hover-effect-border">
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
      setSelectedBlock: editorStore.setSelectedBlock
    }
  },
  beforeDestroy() {
    this.$root.$off('page.data.refresh')
  },
  props: {},
  components: {},
  watch: {},
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
      editorStore.getBlocksData(true)
      this.$root.$on('page.data.refresh', () => editorStore.getBlocksData(true))
    },
  }
})
</script>
<style lang="stylus">
#builderDrawerBlocks
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
