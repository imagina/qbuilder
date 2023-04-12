<template>
  <div id="builderBlockPreview">
    <!--No selected block-->
    <div v-if="!selectedBlock" class="row full-height items-center justify-center">
      <div class="text-center">
        <q-icon name="fa-light fa-puzzle-piece" size="60px" class="text-primary-builder"/>
        <div class="q-mt-md text-h5">{{ $tr('ibuilder.cms.chooseBlock')}}</div>
      </div>
    </div>
  </div>
</template>
<script>
import Vue, {defineComponent, computed} from "vue";
import editorStore from '@imagina/qbuilder/_store/editor'

export default defineComponent({
  setup() {
    return {
      selectedBlock: computed(() => editorStore.state.selectedblock),
    }
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
    return {}
  },
  computed: {},
  methods: {
    init() {
    },
  }
})
</script>
<style lang="stylus">
#builderBlockPreview
  height 100%
  width 100%
</style>
