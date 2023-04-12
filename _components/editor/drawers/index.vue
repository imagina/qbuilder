<template>
  <div id="builderEditorDrawers">
    <!--Block drawers-->
    <q-drawer bordered v-model="drawer.filter" :width="400">
      <blocks-list />
    </q-drawer>
  </div>
</template>
<script>
import blocksList from '@imagina/qbuilder/_components/drawers/block/list.vue'

export default {
  beforeDestroy() {
    this.$eventBus.$off('toggleMasterDrawer')
  },
  props: {},
  components: {
    blocksList
  },
  watch: {},
  mounted() {
    this.$nextTick(function () {
    })
  },
  data() {
    return {
      projectName: this.$store.getters['qsiteApp/getSettingValueByName']('core::site-name'),
      logo: this.$store.state.qsiteApp.logo,
      drawer: {
        filter: true,
      },
    }
  },
  computed: {},
  methods: {
    //init
    init() {
    }
  }
}
</script>
<style lang="stylus">
</style>
