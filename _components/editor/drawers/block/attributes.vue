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
        <div class="col-3" v-if="statusChildBlocks[featureFlagElement.name]">
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
              <div v-if="statusChildBlocks[featureFlagElement.name]">
                <q-separator class="q-mb-md"/>
                <div v-if="device == 0">
                  Mobile
                  <dynamic-field  v-for="(field, fieldName) in attribute" :key="`${fieldName}-mobile`" :field="field"
                               v-model="formMobileAttributesFields[featureFlagElement.name][field.name || fieldName]"/>
                </div>
                <div v-if="device == 1">
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
import Vue, { defineComponent, computed, reactive } from "vue";

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
        this.setAttributes();
      }
    },
    device(){
      this.attributesKey = this.$uid()
    },
    'formEntityFields.type'(newValue){
      if (!this.selectedBlock && newValue) {
        this.setAttributes();
      }
    },
    'formMainFields.componentName'(newValue){
      if (!this.selectedBlock && newValue) {
        this.setAttributes();
      }
    },
  },
  data() {
    return {
      blocksConfiguration: editorStore.models.blocksConfiguration,
      formMainFields: editorStore.models.formMainFields,
      formAttributesFields: editorStore.models.formAttributesFields,
      formMobileAttributesFields: editorStore.models.formMobileAttributesFields,
      device: editorStore.models.device,
      element: null,
      attributesKey: this.$uid(),
      section: 'panel-0',
      panelNames: ['panel-0', 'panel-1', 'panel-2', 'panel-3', 'panel-4', 'panel-5', 'panel-6', 'panel-7', 'panel-8', 'panel-9', 'panel-10', 'panel-11', 'panel-12'],
    }
  },
  computed: {
    formEntityFields: () => editorStore.state.formEntityFields,
    statusChildBlocks: () => editorStore.state.statusChildBlocks,
    selectedBlock: () => editorStore.state.selectedBlock,
    elementSelected: () => editorStore.state.elementSelected,
    blocks: () => editorStore.state.blocks,
    elementSelectedAttr() {
      return this.blockConfig.elements.find(element => element.systemName === this.elementSelected)?.attributes;
    },
    featureFlagElement() {
      return this.blockConfig.elements.find(element => element.systemName === this.elementSelected);
    },
    blockConfig: () => editorStore.state.blockConfig,
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
    setAttributes(){
      const block = this.blocks.find(block => block.component.systemName === this.blockConfig.systemName);
      const blockAttributesDesktop = block.attributes || [];
      const blockAttributesMobile = block.mobileAttributes || [];
      const tmpDesktopAttributes = {};
      const tmpMobileAttributes = {};
      Object.keys(blockAttributesDesktop).forEach(attributeName => {
        if ((blockAttributesDesktop[attributeName] != undefined) && !Array.isArray(blockAttributesDesktop[attributeName])) {
          if(blockAttributesMobile[attributeName]){
            tmpMobileAttributes[attributeName] = {...blockAttributesMobile[attributeName]}
          }else{
            tmpMobileAttributes[attributeName] = {...blockAttributesDesktop[attributeName]}
          }
          tmpDesktopAttributes[attributeName] = {...blockAttributesDesktop[attributeName]}
          
          const objAttrBlock = tmpDesktopAttributes[attributeName];
          if (Object.hasOwn(objAttrBlock, 'propertiesStatus')) {
            this.setStatusChildBlock(attributeName, tmpDesktopAttributes[attributeName].propertiesStatus);
          }else{
            tmpMobileAttributes[attributeName].propertiesStatus = true;
            tmpDesktopAttributes[attributeName].propertiesStatus = true;
            this.setStatusChildBlock(attributeName, true);
          }
          
        } else {
          tmpMobileAttributes[attributeName].propertiesStatus = false;
          tmpDesktopAttributes[attributeName].propertiesStatus = false;
          this.setStatusChildBlock(attributeName, false);
        }
      })

      if(tmpDesktopAttributes['mainblock']){
        tmpDesktopAttributes['mainBlock'] = {...tmpDesktopAttributes['mainblock']};
        tmpMobileAttributes['mainBlock'] = {...tmpMobileAttributes['mainblock']};

        delete tmpDesktopAttributes['mainblock'];
        delete tmpMobileAttributes['mainblock'];
      }

      this.formAttributesFields = reactive(tmpDesktopAttributes)
      this.formMobileAttributesFields = reactive(tmpMobileAttributes)


      console.log(this.formAttributesFields);
      console.log(this.formMobileAttributesFields);
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
