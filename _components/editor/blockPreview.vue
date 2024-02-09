<template>
  <div id="builderBlockPreview">
    <!--No selected block-->
    <div v-if="!selectedBlock && !formEntityFields.type" class="row full-height items-center justify-center bg-white">
      <div class="text-center">
        <q-icon name="fa-light fa-puzzle-piece" size="60px" class="text-primary-builder"/>
        <div class="q-mt-md text-h5">{{ $tr('ibuilder.cms.chooseBlock') }}</div>
      </div>
    </div>
    <!--Iframe/preview-->
    <iframe-post style="height: calc(100vh - 64px)" v-else ref="iframePost"/>
  </div>
</template>
<script>
import editorStore from 'modules/qbuilder/_store/editor'
import iframePost from 'modules/qsite/_components/master/iframePost.vue'

export default {
  props: {},
  components: {iframePost},
  watch: {
    selectedBlock() {
      this.checkDebounce();
    },
    formAttributesFields:{
      handler: function (){
        this.checkDebounce();
      },
      deep : true
    },
    formMobileAttributesFields:{
      deep: true,
      immediate: true,
      handler: function (){
        this.checkDebounce();
      }
    },
    checkingData() {
      this.checkDebounce();
    },
    device(){
      this.checkDebounce();;
    },
  },
  data(){
    return {
      timeout: null
    }
  },
  computed: {
    device: () => editorStore.state.device,
    selectedBlock: () => editorStore.state.selectedBlock,
    formMainFields: () => editorStore.state.formMainFields,
    formEntityFields: () => editorStore.state.formEntityFields,
    formExtraFields: () => editorStore.state.formExtraFields,
    formAttributesFields: () => editorStore.state.formAttributesFields,
    formMobileAttributesFields: () => editorStore.state.formMobileAttributesFields,
    blockConfig: () => editorStore.state.blockConfig,
    checkingData() {
      return {
        ...this.formMainFields,
        ...this.formEntityFields,
        ...this.formExtraFields,
      }
    },
  },
  methods: {
    loadIframe() {
      this.$nextTick(function () {
        if (this.selectedBlock || this.formEntityFields.type) {
            this.$refs.iframePost.loadIframe(
                `${this.$store.state.qsiteApp.baseUrl}/api/ibuilder/v1/block/preview`,
                editorStore.getters.dataBlockPreview.value
            )
          }
      })
    },
    checkDebounce(){
      if (this.timeout) clearTimeout(this.timeout);
      this.timeout = setTimeout(() => {
        this.loadIframe()
      }, 500);
    },
  }
}
</script>
<style lang="scss">
#builderBlockPreview {
  height: 100%;
  width: 100%;
}
</style>
