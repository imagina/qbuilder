<template>
  <div id="builderDrawerBlockAttributes" :key="attributesKey" v-if="blockConfig">
    <!--Title-->
    <div class="drawer-title">
      {{ $trp('ibuilder.cms.block') }}
      <div @click="closeAttributesDrawer" class="text-subtitle1 cursor-pointer">
        {{ $tr("isite.cms.label.ready") }}
      </div>
    </div>
    <!--List the blocks-->
    <q-scroll-area style="height: calc(100vh - 60px)">
      <dynamic-field v-if="element" v-model="element" :field="elementOptions"/>
      <div v-if="element" class="text-center q-mb-md">
        <q-btn-toggle @click="() => resetAttributesKey()" v-model="statusChildBlocks[featureFlagElement.name]"
                      class="my-custom-toggle" no-caps rounded unelevated toggle-color="green" color="grey-3"
                      text-color="green" :options="[
                            { label: `${featureFlagElement.title} (On)`, value: true },
                            { label: `${featureFlagElement.title} (Off)`, value: false }
                ]"/>
      </div>
      <div v-if="element" class="padding-drawer-content row">
        <!-- <dynamic-form v-model="element" :blocks="elementOptions"
                                formType="collapsible"/> -->
        <div class="col-3">
          <q-tabs
              v-model="section"
              vertical
              class="text-primary-builder"
              active-bg-color="primary-builder"
              active-color="white"
              no-caps
              indicator-color="primary-builder"
              content-class="text-right"
          >
            <div v-for="(element, index) in blockConfig.elements" :key="index">
              <q-tab v-if="element.systemName === elementSelected" v-for="(tab, index) in element.attributes"
                     :name="panelNames[index]" :data-test="panelNames[index]" :label="tab.title"
                     :key="`${index}-maintabs`"/>
            </div>
          </q-tabs>
        </div>
        <div class="col-9">
          <!--Main Fields-->
          <div v-for="(attributes, groupIndex) in elementSelectedAttr"
               v-show="section == panelNames[groupIndex]" :key="groupIndex">
            <div v-for="(attribute, index) in attributes" v-if="typeof attribute === 'object'"
                 :key="`${index}-subtabs`">
              <div v-show="statusChildBlocks[featureFlagElement.name]">
                <q-separator class="q-mb-md"/>
                <div v-if="device.value == 0">
                  Mobile
                  <dynamic-field  v-for="(field, fieldName) in attribute" :key="`${fieldName}-mobile`" :field="field"
                               v-model="formMobileAttributesFields[featureFlagElement.name][field.name || fieldName]"/>
                </div>
                <div v-if="device.value == 1">
                  Desktop
                  <dynamic-field  v-for="(field, fieldName) in attribute" :key="`${fieldName}-desktop`" :field="field"
                               v-model="formAttributesFields[featureFlagElement.name][field.name || fieldName]"/>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </q-scroll-area>
  </div>
</template>

<script>
import editorStore from "@imagina/qbuilder/_store/editor";
import Vue, { defineComponent, computed } from "vue";

export default {
  name: 'attributes',
  props: {},
  watch: {
    elementSelected() {
      this.element = this.elementSelected;
      this.attributesKey = this.$uid()
    },
    element(newValue) {
      this.setElementSelected(newValue);
    },
    selectedBlock(newValue) {
      if (newValue) {
        const blockAttributes = this.selectedBlock.attributes
        Object.keys(blockAttributes).forEach(attributeName => {
          if (!Array.isArray(blockAttributes[attributeName])) {    
            this.formMobileAttributesFields[attributeName] = {...blockAttributes[attributeName]}
            this.formAttributesFields[attributeName] = {...blockAttributes[attributeName]}
          } else {
            this.setStatusChildBlock(attributeName, false);
          }
        })
        this.formAttributesFields['mainBlock'] = {...this.formAttributesFields['mainblock']};
        this.formMobileAttributesFields['mainBlock'] = {...this.formMobileAttributesFields['mainblock']};
        delete this.formAttributesFields['mainblock'];
        delete this.formMobileAttributesFields['mainblock'];
      }
    },
    'device.value'(){
      this.attributesKey = this.$uid()
    },
  },
  data() {
    return {
      blocksConfiguration: editorStore.models.blocksConfiguration,
      formMainFields: editorStore.models.formMainFields,
      element: null,
      attributesKey: this.$uid(),
      section: 'panel-0',
      panelNames: ['panel-0', 'panel-1', 'panel-2', 'panel-3', 'panel-4', 'panel-5', 'panel-6', 'panel-7', 'panel-8', 'panel-9', 'panel-10', 'panel-11', 'panel-12'],
      //formAttributesFields: computed(() => editorStore.state.formAttributesFields),
      //formMobileAttributesFields: computed(() => editorStore.state.formMobileAttributesFields),
    }
  },
  computed: {
    statusChildBlocks: () => editorStore.state.statusChildBlocks,
    formAttributesFields: () => editorStore.models.formAttributesFields,
    formMobileAttributesFields: () => editorStore.models.formMobileAttributesFields,
    device: () => editorStore.models.device,
    selectedBlock: () => editorStore.state.selectedBlock,
    elementSelected: () => editorStore.state.elementSelected,
    elementSelectedAttr() {
      const attrs = this.blockConfig.elements.find(element => element.systemName === this.elementSelected)?.attributes;
      //attrs.forEach((attr, index) => attr.tabName = this.panelNames[index]);
      return attrs;
    },
    featureFlagElement() {
      return this.blockConfig.elements.find(element => element.systemName === this.elementSelected);
    },
    blockConfig() {
      const block = Object.values(this.blocksConfiguration).find((block) => {
        return block.systemName == this.formMainFields.componentName;
      });
      return block;
    },
    elementOptions() {
      return {
        type: "select",
        required: true,
        props: {
          label: this.$tr("isite.cms.label.block") + "*",
          options: Object.values(this.blockConfig.elements)
              .map((item) => {
                return {label: item.title, value: item.systemName};
              }),
        },
      }
    },
  },
  methods: {
    setElementSelected(elementSelected) {
      editorStore.methods.setElementSelected(elementSelected);
    },
    setStatusChildBlock: editorStore.methods.setStatusChildBlock,
    closeAttributesDrawer: editorStore.methods.closeAttributesDrawer,
    resetAttributesKey() {
      this.attributesKey = this.$uid()
    },
  }
}
</script>

<style lang="stylus">
#builderDrawerBlockAttributes
.q-tabs
  border-right: 1px solid $grey-3
  min-height 100%

.q-tab
  width: max-content
  float: right
  border-radius 10px 0 0 10px
</style>
