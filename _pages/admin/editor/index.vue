<template>
  <div id="builderEditor" class="row relative-position">
    <!---Component CRUD Slided -->
    <div class="text-right q-mb-md">
      <!--Crud Files-->
      <crud :crud-data="import('@imagina/qbuilder/_crud/layouts')" type="onlyUpdate" ref="crudLayout"
            @created="getLayouts('created')" @updated="getLayouts('updated')" @deleted="getLayouts"
      />
    </div>
    <!--Panels-->
    <div class="preview-panels relative-position" :style="`width: ${store.panelWidth}`">
      <layout-panel @create="crudLayout.create()" @selected="val => changeLayout(val)" :loading="layoutLoading"
                    :items="layouts"/>
      <q-btn v-if="store.layoutSelected" label="Guardar" class="full-width absolute-bottom text-capitalize"
             color="green" no-caps padding="md md" @click="saveLayout" icon="fas fa-save"/>
    </div>
    <!-- Preview -->
    <div class="preview-content" :style="`width: calc(100% - ${store.panelWidth})`">
      <!--Actions-->
      <div class="preview-content__actions row justify-between items-center">
        <div class="q-px-md q-py-sm text-primary text-h6">
          <q-btn v-if="store.layoutSelected" size="xs" padding="sm" class="q-mr-sm" unelevated outline
                 @click="crudLayout.update(store.layoutSelected)" icon="fa-light fa-edit" round color="cyan">
            <q-tooltip>{{ $tr('isite.cms.label.edit') }}</q-tooltip>
          </q-btn>
          {{ titleTab }}
        </div>
        <q-tabs v-if="store.layoutSelected" v-model="layoutTab" align="right" inline-label
                no-caps indicator-color="transparent" :active-bg-color="tabColor" active-color="white"
                :content-class="`text-${tabColor} bg-grey-2`">
          <q-tab name="preview" :label="$tr('ibuilder.cms.label.preview')" icon="fa-light fa-eye"/>
          <q-tab name="builder" :label="$tr('ibuilder.cms.label.builder')" icon="fa-light fa-border-none"/>
        </q-tabs>
      </div>
      <q-separator :color="tabColor" size="3px"/>
      <!--Box with layout-->
      <div class="preview-content__box">
        <q-tab-panels v-if="store.layoutSelected" v-model="layoutTab" animated transition-prev="scale"
                      transition-next="scale">
          <q-tab-panel name="preview" class="q-pa-none">
            <iframe-post :id="`iframeLayout${storeSelectedLayout.id}`" ref="refIframePost"/>
          </q-tab-panel>
          <q-tab-panel name="builder" class="q-pa-none">
            <handle-grid v-model="storeSelectedLayout.blocks" order-by="sortOrder" title-field="internalTitle"/>
          </q-tab-panel>
        </q-tab-panels>
        <!--Message to choose a layout-->
        <div v-else class="text-center q-py-lg">
          <q-icon name="fa-light fa-exclamation-circle" size="60px" color="warning"/>
          <div class="q-mt-md text-h5 text-blue-grey">{{ $tr('ibuilder.cms.label.chooseLayout') }}</div>
        </div>
      </div>
    </div>

    <inner-loading :visible="loading"/>
  </div>
</template>
<script>
import {defineComponent} from 'vue'
import controller from '@imagina/qbuilder/_pages/admin/editor/controller'
//components
import iframePost from "@imagina/qsite/_components/v3/iframePost";
import layoutPanel from '@imagina/qbuilder/_components/layoutPanel';
import handleGrid from '@imagina/qsite/_components/v3/handleGrid';

export default defineComponent({
  props: {},
  components: {
    layoutPanel,
    iframePost,
    handleGrid
  },
  setup() {
    return {...controller()}
  }
})
</script>
<style lang="stylus">
#builderEditor
  .preview-panels, .preview-content
    height 100vh
    max-height 100vh

  .preview-content
    background-color $blue-grey-1
    padding 30px 85px
    overflow scroll

    &__actions
      background-color white

    //border-bottom 1px solid lightgrey

    &__box
      background-color white
</style>
