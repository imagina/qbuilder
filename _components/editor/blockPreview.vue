<template>
  <div id="builderBlockPreview">
    <!--No selected block-->
    <div v-if="!selectedBlock" class="row full-height items-center justify-center">
      <div class="text-center">
        <q-icon name="fa-light fa-puzzle-piece" size="60px" class="text-primary-builder"/>
        <div class="q-mt-md text-h5">{{ $tr('ibuilder.cms.chooseBlock') }}</div>
      </div>
    </div>
    <!--Iframe/preview-->
    <iframe-post v-else ref="iframePost"/>
  </div>
</template>
<script>
import Vue, {defineComponent, computed} from "vue";
import editorStore from '@imagina/qbuilder/_store/editor'
import iframePost from '@imagina/qsite/_components/master/iframePost.vue'

export default defineComponent({
  setup() {
    return {
      selectedBlock: computed(() => editorStore.state.selectedBlock),
      formMainFields: computed(() => editorStore.state.formMainFields),
      formEntityFields: computed(() => editorStore.state.formEntityFields),
      formExtraFields: computed(() => editorStore.state.formExtraFields),
      formAttributesFields: computed(() => editorStore.state.formAttributesFields),
      formMobileAttributesFields: computed(() => editorStore.state.formMobileAttributesFields),
      blockConfig: computed(() => editorStore.state.blockConfig),
    }
  },
  props: {},
  components: {iframePost},
  watch: {
    selectedBlock() {
      this.loadIframe()
    },
    // test(){
    //   this.loadIframe()
    // }
  },
  mounted() {
    this.$nextTick(function () {
    })
  },
  data() {
    return {}
  },
  computed: {
    test(){
      return {
        ...this.formMainFields,
        ...this.formEntityFields,
        ...this.formExtraFields,
        ...this.formAttributesFields,
      }
    },
    //blockConfig: editorStore.getters.blockConfig,
  },
  methods: {
    loadIframe() {
      this.$nextTick(function () {
        if (this.selectedBlock) {
          //console.log(editorStore.getters.dataBlockPreview.value);
          this.$refs.iframePost.loadIframe(
              `${this.$store.state.qsiteApp.baseUrl}/api/ibuilder/v1/block/preview`,
              editorStore.getters.dataBlockPreview.value
          )
        }
      })
    },
  }
})
</script>
<style lang="stylus">
#builderBlockPreview
  height 100%
  width 100%
</style>
