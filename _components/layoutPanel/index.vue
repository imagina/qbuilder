<template>
  <div id="builderPanelLayouts">
    <div class="drawer-title q-py-lg q-px-md">
      <h2 class="text-center text-subtitle1 text-weight-bold">{{ $tr('ibuilder.cms.layouts') }}</h2>
    </div>
    <div class="drawer-body relative-position">
      <!--Buttons actions-->
      <div class="flex q-gutter-xs justify-between">
        <q-btn @click="createItem" outline rounded class="q-mb-sm text-capitalize heigth-button" color="primary" no-caps
               padding="sm lg">
          <q-icon size="xs" left name="fa-solid fa-plus"/>
          <div class="text-center text-weight-bold">
            {{ $tr('ibuilder.cms.newLayout') }}
          </div>
        </q-btn>
        <q-btn @click="refreshLayouts" outline rounded class="q-mb-sm" size="sm" color="primary"
               no-caps icon="fa-light fa-rotate-right" />
      </div>

      <q-separator spaced/>
      <recursive-item id="recursiveItemContent" :translatable="false" :menu="mapLayouts" right-icon/>
      <inner-loading :visible="loading"/>
    </div>
  </div>
</template>
<script>
import {defineComponent} from 'vue'
import controller from '@imagina/qbuilder/_components/layoutPanel/controller'
import recursiveItem from '@imagina/qsite/_components/v3/recursiveItem'

export default defineComponent({
  props: {},
  components: {
    recursiveItem
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

    .heigth-button {
      height 50px
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

  #recursiveItemContent
    .expansion-header {
      font-weight bold
      color $blue-grey
    }

    .q-expansion-item__content, .expansion-header
      background white
    .q-expansion-item__content
      padding 0

    .expansion-border {
      border 1px solid #c7c7c7
      border-radius 5px
      overflow hidden
      margin-bottom 10px
    }

    .element {
      min-height 58px
    }

    .content-item:nth-child(odd)
      background-color: $indigo-1

    .content-item:nth-child(even)
      background-color: white

    .item-is-active
      background: $blue-8

      .q-item__label, .q-icon
        color: white
</style>
