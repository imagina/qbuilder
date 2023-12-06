<template>
  <div id="builderPanelLayouts">
    <div class="drawer-title q-py-lg q-px-md">
      <h2 class="text-center text-subtitle1 text-weight-bold">{{ $tr('ibuilder.cms.layouts') }}</h2>
    </div>
    <div class="drawer-body">
      <q-btn outline rounded class="full-width q-mb-sm text-capitalize" color="primary" no-caps padding="md md">
        <q-icon size="xs" left name="fa-solid fa-plus"/>
        <div class="text-center">
          {{ $tr('ibuilder.cms.newLayout') }}
        </div>
      </q-btn>
      <q-separator spaced/>
      <q-list>
        <q-item v-for="layout in layouts" clickable v-ripple :active="layoutSelected === layout.id"
                @click="layoutSelected = layout.id" active-class="list-selected" :key="layout.id" class="element">
          <q-item-section>
            <span class="ellipsis-2-lines full-width">{{ layout.title }}</span>
          </q-item-section>
          <q-item-section avatar>
            <q-icon size="xs" name="fa-light fa-arrow-right"/>
          </q-item-section>
        </q-item>
      </q-list>
    </div>
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
      this.init()
    })
  },
  data() {
    return {
      layouts: [],
      loading: false,
      layoutSelected: false
    }
  },
  computed: {},
  methods: {
    init() {
      this.getLayouts();
    },
    getLayouts() {
      this.loading = true
      let requestParams = {
        refresh: true
      }

      this.$crud.index('apiRoutes.qbuilder.layouts', requestParams).then((response) => {
        this.loading = false
        this.layouts = response.data
      }).catch((error) => {
        this.$alert.error({message: this.$tr('isite.cms.message.errorRequest')})
        console.error(error)
        this.loading = false
      })
    }
  }
})
</script>
<style lang="stylus">
#builderPanelLayouts
  height 100vh
  border-right 1px solid #c7c7c7

  .drawer-body {
    overflow-y auto
    height calc(100vh - 76px)
    padding 26px 18px 24px 18px

    .element {
      min-height 58px
    }

    .list-selected {
      color: white
      background: $primary
    }
  }

  .drawer-title {
    display fixed
    width 100%
    display flex
    text-align center
    align-items center
    justify-content center
    background-color $primary
    color white
  }
</style>
