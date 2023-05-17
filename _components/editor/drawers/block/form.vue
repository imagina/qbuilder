<template>
  <div id="builderDrawerBlockShow">
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
      <div class="padding-drawer-content">
        <q-tabs v-model="tabFormSection" vertical class="text-teal">
          <q-tab name="main" icon="mail" label="Main"/>
          <q-tab name="content" icon="alarm" label="Content"/>
          <q-tab name="attributes" icon="movie" label="Attributes"/>
        </q-tabs>
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
              colClass: "col-12 col-md-6",
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
              colClass: "col-12 col-md-6",
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
        }]
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
</style>
