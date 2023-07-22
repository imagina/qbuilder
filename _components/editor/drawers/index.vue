<template>
  <div id="builderEditorDrawers">
    <!--Inner Loading-->
    <inner-loading :visible="loading"/>
    <!--Block drawers-->
    <q-drawer bordered v-model="drawers.blocksList" :width="540">
      <blocks-list/>
    </q-drawer>
    <q-drawer bordered v-model="drawers.blocksShow" :width="540" overlay>
      <blocks-form/>
    </q-drawer>
    <q-drawer bordered v-model="drawers.blockAttributes" :width="540">
      <attributesForm/>
    </q-drawer>
  </div>
</template>
<script>
import Vue, {defineComponent, computed} from "vue";
import editorStore from '@imagina/qbuilder/_store/editor'
//Components
import blocksList from '@imagina/qbuilder/_components/editor/drawers/block/list.vue'
import blocksForm from '@imagina/qbuilder/_components/editor/drawers/block/form.vue'
import attributesForm from '@imagina/qbuilder/_components/editor/drawers/block/attributes.vue'

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
    blocksForm,
    attributesForm
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

  .q-page-container{
    padding-left 0 !important
  }

  .padding-drawer-content
    padding 16px 24px
</style>
