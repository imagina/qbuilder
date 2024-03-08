<template>
  <div id="builderEditor" class="row relative-position">
    <!---Component CRUD Slided -->
    <div class="text-right q-mb-md">
      <!--Crud Layouts-->
      <crud :crud-data="import('@imagina/qbuilder/_crud/layouts')" type="onlyUpdate" ref="crudLayout"
            @createdData="(layout) => handleCreateLayout(layout, true)"
            @updated="refreshApiData({crudAction : 'updated'})"
            @deleted="refreshApiData({crudAction : 'deleted'})"
      />
    </div>
    <!--Panels-->
    <div class="preview-panels relative-position" :style="`width: ${store.panelWidth}`">
      <!--Drawer title-->
      <div class="drawer-title q-py-lg q-px-md justify-center">
        <q-select color="primay" label-color="orange" v-model="view" :options="dropdownActions.editor"/>
      </div>

      <!--Render List-->
      <template v-if="view === 'layout'">
        <!--Layout List-->
        <layout-list @create="() => showLayoutPanel = true" ref="refLayoutList" @selected="handleLayoutSelected"
                      @refresh="(val) => loading = val"/>
      </template>
      <template v-else>
        <block-list @create="openBlockPanel" ref="refBlockList" @selected="previewBlock"
                     @refresh="(val) => loading = val"/>
      </template>

      <!--Over panels-->
      <q-dialog v-model="showBlocksPanel" position="left" content-class="builder-panel-dialog" square>
        <blocks-panel @created="block => handleChangesBlock({block, refresh: true, crudAction: 'blockCreated'})"
                      class="full-height" v-bind="infoToCreateBlock"/>
      </q-dialog>
      <!--Block Form-->
      <block-form ref="refBlockForm" @updated="block => handleChangesBlock({block, update: true, refresh: true})"/>
      <!--block attrs from panels-->
      <q-dialog v-model="showBlockAttributesForm" :title="$tr('ibuilder.cms.label.editBlockAttributes')"
                position="left" content-class="builder-panel-dialog" square persistent>
        <block-attributes-form ref="blockAttributesForm"
                               @cancel="() => handleChangesBlock({cancel: true})"
                               @input="response => handleChangesBlock(response)"/>
      </q-dialog>
      <!--Layout panel-->
      <q-dialog v-model="showLayoutPanel" position="left" content-class="builder-panel-dialog" square>
        <layout-library-panel @creating="handleCreateLayout"
                              class="full-height"/>
      </q-dialog>
    </div>
    <!-- Preview -->
    <div class="preview-content" :style="`width: calc(100% - ${store.panelWidth})`">
      <!--Layout Preview-->
      <template v-if="view === 'layout'">
        <!--Header-->
        <div class="preview-content__actions row justify-between items-center">
          <!--Tabs to preview/builder-->
          <q-tabs v-if="store.layoutSelected" v-model="layoutTab" align="right" inline-label
                  no-caps indicator-color="transparent" :active-bg-color="tabColor" active-color="white"
                  :content-class="`text-${tabColor} bg-grey-2`">
            <q-tab name="builder" :label="$tr('ibuilder.cms.label.grid')" icon="fa-light fa-border-none"/>
            <q-tab name="preview" :label="$tr('ibuilder.cms.label.preview')" icon="fa-light fa-eye"
                   @click="previewPage"/>
          </q-tabs>
          <!--Title and edit button-->
          <div class="q-px-md q-py-sm text-blue-grey text-h6">
            {{ titleTab }}
          </div>
          <!--Actions-->
          <div class="q-pr-md" v-if="store.layoutSelected">
            <q-btn size="xs" padding="sm" class="q-mr-sm" unelevated outline
                   @click="() => handleDeleteLayout(store.layoutSelected)" icon="fa-regular fa-trash" round color="negative">
              <q-tooltip>{{ $tr('isite.cms.label.delete') }}</q-tooltip>
            </q-btn>
            <q-btn size="xs" padding="sm" class="q-mr-sm" unelevated outline
                   @click="crudLayout.update(store.layoutSelected)" icon="fa-light fa-edit" round color="cyan">
              <q-tooltip>{{ $tr('isite.cms.label.edit') }}</q-tooltip>
            </q-btn>
            <q-btn outline rounded color="green" no-caps @click="saveBlocks"
                   padding="xs md">
              <q-icon name="fa-light fa-save" size="17px" class="q-mr-sm"/>
              {{ $tr('isite.cms.label.save') }}
            </q-btn>
          </div>
        </div>
        <q-separator :color="tabColor" size="3px"/>
        <!--Builder layout-->
        <div class="preview-content__box">
          <q-tab-panels v-if="store.layoutSelected" v-model="layoutTab" animated transition-prev="scale"
                        transition-next="scale">
            <!--Builder-->
            <q-tab-panel name="builder" class="q-pa-none overflow-hidden">
              <handle-grid :elements="gridBlocks" v-bind="configHandleGrid" ref="handleGrid"
                           @create="(val) => handleCreatingBlock(val)"/>
            </q-tab-panel>
            <!--Preview-->
            <q-tab-panel name="preview" class="q-pa-none">
              <iframe-post :id="`iframeLayout${store.layoutSelected.id}`" ref="refIframePost"/>
            </q-tab-panel>
          </q-tab-panels>
          <!--Message to choose a layout-->
          <div v-else class="text-center q-py-lg">
            <q-icon name="fa-light fa-exclamation-circle" size="60px" color="warning"/>
            <div class="q-mt-md text-h5 text-blue-grey">{{ $tr('ibuilder.cms.label.chooseLayout') }}</div>
          </div>
        </div>
      </template>
      <!--Blocks Preview-->
      <template v-else>
        <!--Header-->
        <div class="preview-content__actions row justify-between items-center">
          <!--Title and edit button Blocks-->
          <div class="q-px-md q-py-sm text-blue-grey text-h6">
            {{ titleTab }}
          </div>
          <!--Actions-->
          <div class="q-pr-md" v-if="store.viewBlockSelected">
            <q-btn size="xs" padding="sm" class="q-mr-sm" unelevated outline
                   @click="() => handleActionsBlock('delete')" icon="fa-regular fa-trash" round color="negative">
              <q-tooltip>{{ $tr('isite.cms.label.delete') }}</q-tooltip>
            </q-btn>
            <q-btn size="xs" padding="sm" class="q-mr-sm" unelevated outline round color="cyan"
                   @click="() => refBlockForm.updateData(store.viewBlockSelected)" icon="fa-regular fa-book">
              <q-tooltip>{{ $tr('ibuilder.cms.label.content') }}</q-tooltip>
            </q-btn>
            <q-btn size="xs" padding="sm" class="q-mr-sm" unelevated outline
                   @click="() => handleActionsBlock('updateAttr')" icon="fa-regular fa-palette" round color="cyan">
              <q-tooltip>{{ $tr('ibuilder.cms.label.attributes') }}</q-tooltip>
            </q-btn>
          </div>
        </div>
        <q-separator :color="tabColor" size="3px"/>
        <!--Builder layout-->
        <div class="preview-content__box">
          <!--Preview Block-->
          <iframe-post v-if="store.viewBlockSelected && !showBlockAttributesForm" :id="`iframeBlock${store.viewBlockSelected.id}`" ref="refIframePost"/>
          <!--Message to choose a layout-->
          <div v-else class="text-center q-py-lg">
            <q-icon name="fa-light fa-exclamation-circle" size="60px" color="warning"/>
            <div class="q-mt-md text-h5 text-blue-grey">{{ $tr('ibuilder.cms.label.chooseBlock') }}</div>
          </div>
        </div>
      </template>

    </div>

    <!--Actions to go page-->
    <q-btn-dropdown round no-caps unelevated split :label="$tr('ibuilder.cms.label.administrator')" @click="goHome"
                    icon="fa-light fa-eye" outline color="primary" class="absolute-top-right">
      <q-list>
        <q-item v-for="(btn, keyItem) in dropdownActions.redirect" :key="keyItem" clickable v-close-popup v-bind="btn.props"
                @click="btn.action != undefined ? btn.action() : null">
          <q-item-section>
            <q-item-label>{{ btn.title }}</q-item-label>
          </q-item-section>
        </q-item>
      </q-list>
    </q-btn-dropdown>

    <inner-loading :visible="loading"/>
  </div>
</template>
<script>
import {defineComponent} from 'vue'
import controller from '@imagina/qbuilder/_pages/admin/editor/controller'
//components
import iframePost from "@imagina/qsite/_components/v3/iframePost";
import layoutList from '@imagina/qbuilder/_components/layoutList';
import blocksPanel from '@imagina/qbuilder/_components/blocksPanel';
import handleGrid from '@imagina/qsite/_components/v3/handleGrid';
import blockForm from "@imagina/qbuilder/_components/blockContentForm/index.vue";
import blockAttributesForm from '@imagina/qbuilder/_components/blockAttributesForm'
import layoutLibraryPanel from '@imagina/qbuilder/_components/layoutLibraryPanel'
import blockList from '@imagina/qbuilder/_components/blockList';

export default defineComponent({
  props: {},
  components: {
    blockForm,
    iframePost,
    layoutList,
    blockList,
    blocksPanel,
    handleGrid,
    blockAttributesForm,
    layoutLibraryPanel
  },
  setup() {
    return {...controller()}
  }
})
</script>
<style lang="stylus">
#builderEditor
  .drawer-title {
    display fixed
    width 100%
    display flex
    text-align center
    align-items center
    background-color $primary
    color white
  }


  .q-field__control {
    span, .q-select__dropdown-icon {
      color: white;
    }
  }

  .preview-panels, .preview-content
    height 100vh
    max-height 100vh

  .preview-content
    background-color $blue-grey-1
    padding 50px 85px 30px 85px
    overflow scroll

    &__actions
      background-color white

    &__box
      background-color white

.builder-panel-dialog
  .q-dialog__inner
    padding 0
    max-height 100vh
    max-width 100vw

    > div:first-child
      max-height 100vh
      height 100vh !important

  #blockAttributesForm
    width 100vw !important
    max-width 100vw
</style>
