<template>
  <div id="builderPanelLayouts">
    Hello world
  </div>
</template>
<script>
import Vue, {defineComponent, computed} from "vue";
import store from '@imagina/qbuilder/_store/editor'

export default defineComponent({
  setup() {
    return {
      width: computed(() => store.state.panelWidth)
    }
  },
  props: {},
  components: {},
  watch: {},
  mounted() {
    this.$nextTick(function () {
    })
  },
  data() {
    return {
      loading: false
    }
  },
  computed: {},
  methods: {
    init() {
    }
  }
})
</script>
<style lang="stylus">
</style>
