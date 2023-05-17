<template>
  <div id="builderEditorDrawers">
    <!--Inner Loading-->
    <inner-loading :visible="loading"/>
    <!--Block drawers-->
    <q-drawer bordered v-model="drawers.blocksList" :width="400">
      <blocks-list/>
    </q-drawer>
    <q-drawer bordered v-model="drawers.blocksShow" :width="500" overlay>
      <blocks-form/>
    </q-drawer>
  </div>
</template>
<script>
import Vue, {defineComponent, computed} from "vue";
import editorStore from '@imagina/qbuilder/_store/editor'
//Components
import blocksList from '@imagina/qbuilder/_components/editor/drawers/block/list.vue'
import blocksForm from '@imagina/qbuilder/_components/editor/drawers/block/form.vue'

export default defineComponent({
  setup() {
    return {
      loading: computed(() => editorStore.state.loading),
      drawers: computed(() => editorStore.state.drawers)
    }
  },
  props: {},
  components: {
    blocksList,
    blocksForm
  },
  watch: {},
  mounted() {
    this.$nextTick(function () {
    })
  },
  data() {
    return {
      projectName: this.$store.getters['qsiteApp/getSettingValueByName']('core::site-name'),
      logo: this.$store.state.qsiteApp.logo
    }
  },
  computed: {},
  methods: {
    //init
    init() {
    }
  }
})
</script>
<style lang="stylus">
#builderEditorDrawers
  .drawer-title
    background-color $primaryBuilder
    padding 16px 24px
    color white
    font-size 18px
    display flex
    align-items center
    justify-content space-between

  .padding-drawer-content
    padding 16px 24px

  .box
    padding 0
    box-shadow 0
    margin 0
    box-shadow none
    border-right 0
</style>
