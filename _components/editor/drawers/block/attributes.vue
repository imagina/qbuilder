<template>
  <div id="builderDrawerBlockAttributes" :key="attributesKey" v-if="blockConfig">
    <!--Title-->
    <div class="drawer-title" style="padding: 16px 24px;">
      <div class="col-8">
        {{getInternalName}}
      </div>
      <div class="col-4 text-right">
        <!--Close Button-->
        <q-btn @click="closeBlockShow" color="primary" color-text="white" no-caps ripple label= "Cerrar"/>
      </div>
    </div>
    <!--List the blocks-->
    <div>
      <div class="q-px-md q-pt-md row">
        <div class="col-9">
          <dynamic-field v-if="element" v-model="element" :field="elementOptions"/>
        </div>
        <div v-if="element && featureFlagElement" class="col-3 text-right">
          <q-toggle @input="() => resetAttributesKey()"
                    v-model="statusChildBlocks[featureFlagElement.name]"
                    :label="statusChildBlocks[featureFlagElement.name] ? 'Active': 'Disabled' "
                    color="green"
                    left-label />
        </div>
      </div>
      <div class="row bg-green q-py-sm" v-if="(section == '')" style="height: 52px">
        <div class="col-3">
          <q-btn icon="fa-light fa-chevron-left" rounded unelevated flat color="white" @click="closeAttributesDrawer" />
        </div>
        <div class="col-6 text-center text-white text-bold text-h6">
            Attributes
        </div>
      </div>
      <div v-if="element" class="row">
        <!-- <dynamic-form v-model="element" :blocks="elementOptions"
                                formType="collapsible"/> -->
        <div class="col-12">
          <q-scroll-area v-if="(section == '') && statusChildBlocks[featureFlagElement.name]" style="height: calc(100vh - 260px)">
            <div class="row q-pl-md" v-for="(element, index) in blockConfig.elements" :key="index">
              <template v-for="(tab, index) in element.attributes" :key="`${index}-maintabs`">
                <q-card
                  v-show="section == ''"
                  v-if="element.systemName === elementSelected"
                  :name="panelNames[index]" :data-test="panelNames[index]" :label="tab.title"
                  @click="section = panelNames[index]" class="col-5 q-ma-md cursor-pointer"
                  flat
                  bordered
                  v-ripple
                >
                  <div class="text-subtitle2 text-bold bg-grey-3 q-px-md q-py-xs ellipsis">
                    {{tab.title}}
                  </div>
                  <q-card-section>
                    <div class="text-subtitle2">
                      <p
                        class="ellipsis-3-lines"
                        v-text="$tr('ibuilder.cms.defaultAttributesDescription')"
                      />
                    </div>
                  </q-card-section>
                </q-card>
              </template>
            </div>
          </q-scroll-area>
        </div>
      </div>
      <div v-if="element" class="row">
          <!--Main Fields-->
          <div v-for="(attributes, groupIndex) in elementSelectedAttr"
               v-show="(section == panelNames[groupIndex]) && statusChildBlocks[featureFlagElement.name]" :key="groupIndex" class="col-12">
            <div class="row bg-green">
              <div class="col-3 q-py-sm">
                <q-btn icon="fa-light fa-chevron-left" rounded unelevated flat color="white" @click="section=''" />
              </div>
              <div class="col-6 text-center text-white text-bold text-h6 q-py-sm">
                {{attributes.title}}
              </div>
              <div class="col-3 text-right text-white q-pr-sm">
                <q-toggle
                    v-model="device"
                    keep-color
                    checked-icon="fa-light fa-desktop "
                    unchecked-icon="fa-light fa-mobile"
                    :true-value="1"
                    :false-value="0"
                    size="lg"
                    color="white"
                    icon-color="grey"
                    left-label
                    :label="device ? 'Desktop': 'Mobile'"
                  />
              </div>
            </div>
            <q-scroll-area style="height: calc(100vh - 265px)">
              <div class="row">
                <div class="col-12 q-px-md q-my-md">
                  <p v-text="$tr('ibuilder.cms.defaultAttributesDescription')" />
                </div>
              </div>
              <div class="row q-pb-xl">
                <div class="col-12 q-px-md q-py-sm">
                  <template v-for="(attribute, index) in attributes" :key="`${index}-subtabs`">
                    <div v-if="typeof attribute === 'object'">
                      <div v-if="statusChildBlocks[featureFlagElement.name]">
                        <div v-if="device == 0" class="q-gutter-y-sm">
                          <dynamic-field  v-for="(field, fieldName) in attribute" :key="`${fieldName}-mobile`" :field="field"
                                          v-model="formMobileAttributesFields[featureFlagElement.name][field.name || fieldName]"/>
                        </div>
                        <div v-if="device == 1" class="q-gutter-y-sm">
                          <dynamic-field  v-for="(field, fieldName) in attribute" :key="`${fieldName}-desktop`" :field="field"
                                          v-model="formAttributesFields[featureFlagElement.name][field.name || fieldName]"/>
                        </div>
                      </div>
                    </div>
                  </template>
                </div>
              </div>
            </q-scroll-area>
            <q-separator />
          </div>
      </div>
      <saveButton />
    </div>
  </div>
</template>

<script>
import editorStore from "modules/qbuilder/_store/editor";
import Vue, { defineComponent, computed, reactive } from "vue";
import saveButton from 'modules/qbuilder/_components/editor/drawers/block/saveButton.vue'

export default {
  name: 'attributes',
  setup(){
    return {
      createMode: computed(() => editorStore.state.createMode),
      device: editorStore.models.device,
    }
  },
  components: {
    saveButton
  },
  props: {},
  watch: {
    elementSelected() {
      this.element = this.elementSelected;
      this.attributesKey = this.$uid()
      this.section = '';
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
      this.$set(this.formEntityFields, "id", null)
      this.$set(this.formEntityFields, "params", {"filter": {}, "take": 12})
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
      section: '',
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
    getInternalName() {
      return (this.selectedBlock && this.formMainFields ? this.formMainFields[this.$store.state.qsiteApp.defaultLocale].internalTitle : 'New Block' )
    }
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
        const blockAttributesDesktop = block ? block.attributes : [];
        const blockAttributesMobile = block ? block.mobileAttributes : [];
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
    },
    closeBlockShow: editorStore.methods.closeBlockShow
  }
}
</script>

<style scoped lang="scss">
#builderDrawerBlockAttributes {
  .q-tabs {
    min-height: 100%;
  }

  .q-tab {
    width: max-content;
    float: right;
    border-radius: 10px 0 0 10px;
  }

  .q-card:hover {
    border-color: $primary;
  }
}
</style>
