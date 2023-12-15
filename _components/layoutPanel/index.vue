<template>
  <div id="builderPanelLayouts">
    <div class="drawer-title q-py-lg q-px-md">
      <h2 class="text-center text-subtitle1 text-weight-bold">{{ $tr('ibuilder.cms.layouts') }}</h2>
    </div>
    <div class="drawer-body relative-position">
      <q-btn outline rounded class="full-width q-mb-sm text-capitalize" color="primary" no-caps padding="md md">
        <q-icon size="xs" left name="fa-solid fa-plus"/>
        <div class="text-center">
          {{ $tr('ibuilder.cms.newLayout') }}
        </div>
      </q-btn>
      <q-separator spaced/>
      <q-list>
        <q-item v-for="(item, key) in items" :key="item.id" clickable v-ripple active-class="list-selected"
                class="element" :active="itemSelected ? (itemSelected.id == item.id) : false"
                @click="setItemSelected(item)">
          <q-item-section>
            <span class="ellipsis-2-lines full-width">{{ item.title }}</span>
          </q-item-section>
          <q-item-section avatar>
            <q-icon size="xs" name="fa-light fa-arrow-right"/>
          </q-item-section>
        </q-item>
      </q-list>
      <inner-loading :visible="loading"/>
    </div>
  </div>
</template>
<script>
import {defineComponent} from 'vue'
import controller from '@imagina/qbuilder/_components/layoutPanel/controller'

export default defineComponent({
  props: {
    items: {
      type: Array,
      default: []
    },
    loading: {
      type: Boolean,
      default: false
    }
  },
  setup(props, {emit}) {
    return controller(props, emit)
  }
})
</script>
<style lang="stylus">
#builderPanelLayouts
  height 100vh
  border-right 1px solid #c7c7c7

  .drawer-body {
    overflow-y auto
    height calc(100vh - 130px)
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
