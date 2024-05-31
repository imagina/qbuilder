<template>
  <div id="blockAttributesForm" class="bg-white">
    <!--Header-->
    <div class="drawer-title row justify-between q-py-md q-px-md bg-primary text-white">
      <h2 class="col-11 text-center text-subtitle1 text-weight-bold">{{ $tr('ibuilder.cms.blockEdit') }} - ID:
        {{ block.id }}</h2>
      <!-- Close button -->
      <q-btn unelevated color="white" outline round icon="fa fa-close"
             @click="discardChanges" />
    </div>
    <div class="row q-col-gutter-x-md relative-position">
      <!--Panel-->
      <div id="panelContent" :style="`width: ${panelWidth}`">
        <div class="row">
          <div id="componentsNameContent" class="q-pt-xl" :style="`width: 30%`">
            <q-tabs v-model="selectedComponentKey" vertical active-bg-color="primary" inline-label active-color="white"
                    indicator-color="primary" class="scroll-content" content-class="alternating-colors" @click="() => setVModels()"
                    @update:model-value="handleAllowEditIndicator">
              <q-tab v-for="(component, keyItem) in componentConfigs" :key="keyItem" :name="component.componentKey"
                     content-class="full-width" no-caps>
                <div class="full-width row justify-between items-center">
                  {{ component.title }}
                  <q-icon name="fa-light fa-arrow-right" class="q-mr-xs" size="16px"
                          :color="selectedComponentKey == component.componentKey ? 'white' : 'blue-grey'" />
                </div>
              </q-tab>
            </q-tabs>
          </div>
          <div :style="`width: 70%`">
            <!--Tabs-->
            <q-tabs v-model="tabName" inline-label no-caps indicator-color="transparent" class="full-width"
                    :active-bg-color="tabColor" active-color="white" :content-class="`text-${tabColor} bg-grey-2`"
                    @update:model-value="handleAllowEditIndicator">
              <q-tab name="attributes" :label="$tr('ibuilder.cms.label.attributes')" />
              <q-tab name="content" :label="$tr('ibuilder.cms.label.content')" />
            </q-tabs>
            <q-separator :color="tabColor" size="2px" />
            <!--Tab panels-->
            <div id="formPanelsContent" class="q-pa-sm relative-position">
              <q-tab-panels v-model="tabName" animated transition-prev="scale"
                            transition-next="scale" class="scroll-content">
                <q-tab-panel name="attributes" class="q-pa-none">
                  <!--Empty Result-->
                  <not-result v-if="!hasFields(attributesForm)" class="q-mt-xl" />

                  <dynamic-form v-else v-model="formAttributes" @update:modelValue="mergeDataForm" :blocks="attributesForm"
                                formType="collapsible" no-actions />
                </q-tab-panel>
                <q-tab-panel name="content" class="q-pa-none">
                  <!--Empty Result-->
                  <not-result v-if="!hasFields(contentForm)" class="q-mt-xl" />

                  <dynamic-form v-model="formContent" @update:modelValue="mergeDataForm" :blocks="contentForm"
                                formType="grid" no-actions />
                </q-tab-panel>
              </q-tab-panels>
              <!-- inner loading -->
              <inner-loading :visible="!allowEdit" />
            </div>
          </div>
        </div>
      </div>
      <!--Preview-->
      <div id="previewContent" :style="`width: calc(100% - ${panelWidth})`">
        <iframe-post :id="`iframeBlock${block.id}`" ref="refIframePost" />
      </div>

      <!-- Actions -->
      <div id="actionsContent" class="absolute-bottom-right q-mb-sm q-mr-lg">
        <q-btn-dropdown split rounded dense no-caps padding="xs 15px"
                        color="green" outline text-color="green"
                        :label="$tr('isite.cms.label.save')"
                        @click="updateBlock({})"
        >
          <q-list>
            <q-item clickable v-close-popup @click="updateBlock({ closeModal: true })" class="q-px-sm">
              <q-item-section>
                <q-item-label>{{ $tr('isite.cms.message.saveAndReturn') }}</q-item-label>
              </q-item-section>
            </q-item>
          </q-list>
        </q-btn-dropdown>
      </div>
    </div>

    <inner-loading :visible="loading" />
  </div>
</template>
<script lang="ts">
import { defineComponent } from 'vue';
import controller from 'src/modules/qbuilder/_components/blockAttributesForm/controller';
import iframePost from 'src/modules/qsite/_components/v3/iframePost/index.vue';

export default defineComponent({
  props: {},
  components: { iframePost },
  emits: ['updateBlock','cancel'],
  setup(props, { emit }) {
    return controller(props, emit);
  }
});
</script>
<style lang="scss">
#blockAttributesForm {
  #panelContent {
    border-right: 1px solid #c7c7c7;

    #componentsNameContent {
      border-right: 1px solid $blue-grey-1;
    }

    #formPanelsContent {
      height: calc(100vh - 130px);
      overflow-y: scroll;
    }
  }

  #previewContent {
    background-color: $blue-grey-1;
    padding: 30px 85px;
    overflow: scroll;
    display: flex;
    align-items: center;

    #iframePostcomponent {
      display: flex;
      align-items: center;
      height: 500px;
    }
  }
}
</style>
