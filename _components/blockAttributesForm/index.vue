<template>
  <div id="blockAttributesForm" class="bg-white">
    <div class="drawer-title q-py-md q-px-md bg-primary text-white">
      <h2 class="text-center text-subtitle1 text-weight-bold"> Block Edit (PT) </h2>
    </div>
    <div class="row q-col-gutter-x-md">
      <!--Panel-->
      <div id="panelContent" :style="`width: ${panelWidth}`">
        <div class="row">
          <div id="componentsNameContent" class="q-pt-xl" :style="`width: 30%`">
            <q-tabs v-model="selectedComponentKey" vertical active-bg-color="primary" inline-label active-color="white"
                    indicator-color="primary" class="scroll-content" content-class="alternating-colors"
                    @input="handleAllowEditIndicator">
              <q-tab v-for="(component, keyItem) in componentsConfig" :key="keyItem" :name="component.componentKey"
                     content-class="full-width" no-caps>
                <div class="full-width row justify-between items-center">
                  {{ component.title }}
                  <q-icon name="fa-light fa-arrow-right" class="q-mr-xs" size="16px"
                          :color="selectedComponentKey == component.componentKey ? 'white' : 'blue-grey'"/>
                </div>
              </q-tab>
            </q-tabs>
          </div>
          <div :style="`width: 70%`">
            <!--Tabs-->
            <q-tabs v-model="tabName" inline-label no-caps indicator-color="transparent" class="full-width"
                    :active-bg-color="tabColor" active-color="white" :content-class="`text-${tabColor} bg-grey-2`"
                    @input="handleAllowEditIndicator">
              <q-tab name="attributes" label="Attributes (PT)"/>
              <q-tab name="content" label="Content (PT)"/>
            </q-tabs>
            <q-separator :color="tabColor" size="2px"/>
            <!--Tab panels-->
            <div id="formPanelsContent" class="q-pa-sm relative-position">
              <q-tab-panels v-model="tabName" animated transition-prev="scale"
                            transition-next="scale" class="scroll-content">
                <q-tab-panel name="attributes" class="q-pa-none">
                  <dynamic-form v-model="formAttributes" @input="mergeDataForm" :blocks="attributesForm"
                                formType="collapsible" no-actions/>
                </q-tab-panel>
                <q-tab-panel name="content" class="q-pa-none">
                  <dynamic-form v-model="formContent" @input="mergeDataForm" :blocks="contentForm"
                                formType="grid" no-actions/>
                </q-tab-panel>
              </q-tab-panels>
              <!-- inner loading -->
              <inner-loading :visible="!allowEdit"/>
            </div>
          </div>
        </div>
        <!-- Actions -->
        <div id="actionsContent" class="row">
          <q-btn v-for="(btn, keyBtn) in generalActions" :key="keyBtn" unelevated square
                 @click="btn.action" class="col-6" v-bind="btn.props"/>
        </div>
      </div>
      <!--Preview-->
      <div id="previewContent" :style="`width: calc(100% - ${panelWidth})`">
        <iframe-post :id="`iframeBlock${block.id}`" ref="refIframePost"/>
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import {defineComponent} from 'vue'
import controller from '@imagina/qbuilder/_components/blockAttributesForm/controller'
import iframePost from "@imagina/qsite/_components/v3/iframePost/index.vue";

export default defineComponent({
  props: {},
  components: {iframePost},
  setup(props, {emit}) {
    return controller(props, emit)
  }
})
</script>
<style lang="stylus">
#blockAttributesForm
  #panelContent
    border-right 1px solid #c7c7c7

    #componentsNameContent
      border-right 1px solid $blue-grey-1

    #formPanelsContent
      height: calc(100vh - 146px)
      overflow-y: scroll

  #previewContent
    background-color $blue-grey-1
    padding 30px 85px
    overflow scroll
    display flex
    align-items center
    height 80%

    #iframePostcomponent
      display flex
      align-items center

  #actionsContent
    .q-btn
      border-radius 0 !important
</style>
