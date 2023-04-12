<template>
  <div id="pageBuilderEditor" class="bg-blue-grey-3">
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
  watch: {},
  mounted() {
    this.$nextTick(() => {
      //this.$refs['form-editor'].submit();
    })
  },
  computed: {},
  methods: {
    sendForm() {
      console.log("XD");
    },
  }
})
</script>
<style lang="stylus">
#pageBuilderEditor
  padding 50px 100px
  height 100vh
  width 100%

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
