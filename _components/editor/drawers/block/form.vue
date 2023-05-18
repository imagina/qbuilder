<template>
  <div id="builderDrawerBlockForm" v-if="selectedBlock">
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
        <div class="col-3">
          <q-tabs v-model="tabFormSection" vertical
                  class="text-primary-builder"
                  active-bg-color="primary-builder"
                  active-color="white" no-caps
                  indicator-color="primary-builder"
                  content-class="text-right"
          >
            <q-tab name="main" label="Main"/>
            <q-tab name="content" label="Content"/>
            <q-tab name="attributes" label="Attributes"/>
          </q-tabs>
        </div>
        <div class="col-9">
          <q-tab-panels
            v-model="tabFormSection"
            animated
            swipeable
            vertical
            keep-alive
            transition-prev="jump-up"
            transition-next="jump-up"
          >
            <q-tab-panel name="main">
              <!--Main Fields-->
              <dynamic-form v-model="mainFields" :blocks="formFields.block" formType="grid" no-actions
                            no-reset-with-blocks-update/>
            </q-tab-panel>
            <q-tab-panel name="content">
              Constent...
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
      closeBlockShow: editorStore.closeBlockShow,
      mainFields: editorStore.models.formMainFields,
    }
  },
  computed: {
    selectedBlock: () => editorStore.state.selectedBlock,
    blocks: () => editorStore.state.blocks,
    formFields() {
      return {
        block: [{
          name: "main",
          fields: {
            helpText: {
              type: "banner",
              colClass: "col-12",
              props: {
                message: "Selecciona un 'Nombre de Sistema' unico que identifique el bloque y luego el componente que quieres perzonalizar..."
              }
            },
            internalTitle: {
              isTranslatable: true,
              type: "input",
              required: true,
              colClass: "col-12",
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
              colClass: "col-12",
              props: {
                label: this.$tr("isite.cms.form.systemName") + "*"
              }
            },
            componentName: {
              type: "select",
              required: true,
              colClass: "col-12",
              props: {
                label: this.$tr("isite.cms.label.block") + "*",
                options: Object.values(this.blocks).filter(item => !item.internal).map(item => {
                  return {label: item.internalTitle, value: item.systemName}
                }),
                readonly: this.blockId ? true : false
              }
            },
            mediasSingle: {
              value: {},
              type: 'media',
              colClass: "col-12",
              fieldItemId: this.blockId || null,
              props: {
                label: this.$tr('isite.cms.message.preview'),
                zone: 'internalimage',
                entity: "Modules\\Ibuilder\\Entities\\Block",
                entityId: null
              }
            }
          }
        }],
        entity: {
          title: this.$trp("isite.cms.label.content"),
          fields: {
            helpText: {
              type: "banner",
              colClass: "col-12",
              props: {
                message: "Configura aquí el contenido del componente..."
              }
            },
            type: {
              type: "select",
              require: true,
              //colClass: (this.formEntity.type && !this.loadOptionsContent) ? "col-12" : null,
              props: {
                label: `${this.$tr('isite.cms.label.entity')}*`,
                rules: [
                  val => !!val || this.$tr('isite.cms.message.fieldRequired')
                ],
                options: this.selectedBlock?.block.content || []
              }
            },
            id: {
              type: "select",
              require: true,
              vIf: this.loadOptionsContent ? true : false,
              props: {
                label: `${this.$tr('isite.cms.label.record')}*`,
                rules: [
                  val => !!val || this.$tr('isite.cms.message.fieldRequired')
                ]
              },
              loadOptions: this.loadOptionsContent
            },
            params: {
              type: "json",
              require: true,
              colClass: "col-12",
              vIf: (this.formEntity.type && !this.loadOptionsContent) ? true : false,
              props: {
                label: this.$trp('isite.cms.label.filter'),
                rules: [
                  val => !!val || this.$tr('isite.cms.message.fieldRequired')
                ]
              }
            },
          }
        },
      }
    }
  },
  methods: {
    init() {
    },
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
