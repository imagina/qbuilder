<template>
  <div id="builderDrawerBlockForm">
    <!--Title-->
    <div class="drawer-title">
      {{ $tr('ibuilder.cms.blockDesign') }}
      <!--Close Button-->
      <div @click="closeBlockShow" class="text-subtitle1 cursor-pointer">
        {{ $tr('isite.cms.label.ready') }}
      </div>
    </div>
    <!--Content-->
    <q-scroll-area style="height: calc(100vh - 60px)">
      <div class="padding-drawer-content row" style="height: calc(100vh - 60px)">
        <!--Button Tabs-->
        <div class="col-3">
          <q-tabs v-model="tabFormSection" vertical class="text-primary-builder"
                  active-bg-color="primary-builder" active-color="white" no-caps
                  indicator-color="primary-builder" content-class="text-right">
            <q-tab name="main" label="Main"/>
            <q-tab name="content" :label="$trp('isite.cms.label.content')"/>
            <q-tab name="attributes" label="Attributes"/>
          </q-tabs>
        </div>
        <!-- Form  Content-->
        <div class="col-9">
          <q-tab-panels v-model="tabFormSection" animated vertical keep-alive
                        transition-prev="jump-up" transition-next="jump-up">
            <!--Main Fields-->
            <q-tab-panel name="main">
              <dynamic-form v-model="formMainFields" :blocks="mainFields" formType="grid" no-actions
                            default-col-class="col-12" :box-style="false"/>
            </q-tab-panel>
            <!--Entity Fields-->
            <q-tab-panel name="content">
              <dynamic-form v-model="formEntityFields" :blocks="entityFields" formType="grid" no-actions
                            v-if="blockConfig && blockConfig.content.length" default-col-class="col-12"
                            no-reset-with-blocks-update :box-style="false"/>
            </q-tab-panel>
            <q-tab-panel name="attributes">
              Attributes...
            </q-tab-panel>
          </q-tab-panels>
        </div>
      </div>
    </q-scroll-area>
  </div>
</template>
<script>
import Vue, {defineComponent, computed} from "vue";
import editorStore from '@imagina/qbuilder/_store/editor'

export default {
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
      tabFormSection: 'main',
      blocksConfiguration: editorStore.models.blocksConfiguration,
      formMainFields: editorStore.models.formMainFields,
      formEntityFields: editorStore.models.formEntityFields,
      formExtraFields: editorStore.models.formExtraFields
    }
  },
  computed: {
    //Return the state of selectedBlock from the editor store
    selectedBlock: () => editorStore.state.selectedBlock,
    //Return the block config of the block choosed in the main fields
    blockConfig() {
      return Object.values(this.blocksConfiguration).find(block =>
        block.systemName == this.formMainFields.componentName
      )
    },
    //Return the fields for Main fields section
    mainFields() {
      return [{
        name: "main",
        fields: {
          helpText: {
            type: "banner",
            props: {
              message: "Selecciona un 'Nombre de Sistema' unico que identifique el bloque y luego el componente que quieres perzonalizar..."
            }
          },
          internalTitle: {
            isTranslatable: true,
            type: "input",
            required: true,
            props: {
              label: this.$tr("isite.cms.form.title") + "*",
              rules: [
                val => !!val || this.$tr('isite.cms.message.fieldRequired')
              ],
            }
          },
          systemName: {
            type: "input",
            required: true,
            props: {
              label: this.$tr("isite.cms.form.systemName") + "*"
            }
          },
          componentName: {
            type: "select",
            required: true,
            props: {
              label: this.$tr("isite.cms.label.block") + "*",
              options: Object.values(this.blocksConfiguration).filter(item => !item.internal).map(item => {
                return {label: item.title, value: item.systemName}
              }),
              readonly: this.blockId ? true : false
            }
          },
          mediasSingle: {
            value: {},
            type: 'media',
            fieldItemId: this.blockId || null,
            props: {
              label: this.$tr('isite.cms.message.preview'),
              zone: 'internalimage',
              entity: "Modules\\Ibuilder\\Entities\\Block",
              entityId: null
            }
          }
        }
      }]
    },
    //Return the fields for Entity fields section
    entityFields() {
      //Search and instance the loadOptions config to request the entityId options
      let loadOptionsForEntityId = this.blockConfig.content.find(item => item.value == this.formEntityFields.type)
      loadOptionsForEntityId = loadOptionsForEntityId?.loadOptions || null

      //Instance and return the response
      return [{
        fields: {
          helpText: {
            type: "banner",
            props: {
              message: "Configura aquí el contenido del componente..."
            }
          },
          type: {
            type: "select",
            require: true,
            props: {
              label: `${this.$tr('isite.cms.label.entity')}*`,
              rules: [
                val => !!val || this.$tr('isite.cms.message.fieldRequired')
              ],
              options: this.blockConfig.content
            }
          },
          id: {
            type: "select",
            require: true,
            vIf: loadOptionsForEntityId ? true : false,
            props: {
              label: `${this.$tr('isite.cms.label.record')}*`,
              rules: [
                val => !!val || this.$tr('isite.cms.message.fieldRequired')
              ]
            },
            loadOptions: loadOptionsForEntityId
          },
          params: {
            type: "json",
            require: true,
            vIf: (this.formEntityFields.type && !loadOptionsForEntityId) ? true : false,
            props: {
              label: this.$trp('isite.cms.label.filter'),
              rules: [
                val => !!val || this.$tr('isite.cms.message.fieldRequired')
              ]
            }
          },
        },
      }]
    },
    //Return the fields for Extra fields section
    extraFields(){

    }
  },
  methods: {
    init() {
      editorStore.methods.getBlocksConfiguration(true)
    },
    //Close the form block drawer and back to the list
    closeBlockShow: editorStore.methods.closeBlockShow,
  }
}
</script>
<style lang="stylus">
#builderDrawerBlockForm
  .q-tabs
    border-right: 1px solid $grey-3
    min-height 100%

  .q-tab
    width: max-content
    float: right
    border-radius 10px 0 0 10px
</style>
