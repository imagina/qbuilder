<template>
  <div id="builderBlockForm" class="bg-white relative-position">
    <q-form autocorrect="off" autocomplete="off" ref="formContent" @submit="submitData"
            @validation-error="$alert.error($tr('isite.cms.message.formInvalid'))">
      <div class="q-pt-sm q-px-sm">
        <!--Title-->
        <div class="box-title text-center q-mb-md">Crea un nuevo Bloque (PT)</div>
        <!--Description-->
        <div class="text-body2 q-mb-md text-grey-8">Aqui puedes crear un nuevo bolque (PT)</div>

        <q-separator />
      </div>

      <!--Form block-->
      <dynamic-form v-model="formBlock" no-actions ref="mainForm" no-reset-with-blocks-update
                    formType="grid" :blocks="formFields.block" />

      <!--Form Content-->
      <div v-if="contentfieldsconfig.show" class="box box-auto-height q-mb-md">
        <div class="row q-col-gutter-x-md">
          <!--Title-->
          <div class="box-title text-primary q-mb-md">
            {{ $tr('isite.cms.label.content') }}
          </div>
          <!-- Entity Content -->
          <div v-if="contentfieldsconfig.content.length" class="col-12">
            <div v-for="(field, key) in formFields.entity.fields" :key="key"
                 :class="field.colClass || field.columns || 'col-12 col-md-6'">
              <dynamic-field v-model="formEntity[field.name || key]" :key="key" :field="field"
                             v-if="field.vIf !== undefined ? field.vIf : true" :item-id="block.id"/>
            </div>
          </div>

<!--          &lt;!&ndash; Form Content Fields &ndash;&gt;-->
<!--          <div class="col-12 no-child-box">-->
<!--            <dynamic-form v-if="contentfieldsconfig.contentFields.length" :box-style="false"-->
<!--                          v-model="formContentFields" :blocks="contentfieldsconfig.contentFields"-->
<!--                          ref="formContentFields" formType="grid" no-actions/>-->
<!--          </div>-->
        </div>
      </div>
      <!--Actions-->
      <div class="box box-auto-height text-right">
        <q-btn unelevated rounded no-caps type="submit" :label="$tr('isite.cms.label.save')"
               color="green"/>
      </div>
    </q-form>
  </div>
</template>
<script lang="ts">
import {defineComponent} from 'vue'
import controller from '@imagina/qbuilder/_components/blockForm/controller'
import { Block } from '@imagina/qbuilder/_components/blocksPanel/interface'

export default defineComponent({
  props: {
    block: { type: Object },
  },
  components: {},
  setup(props, {emit}) {
    return controller(props, emit)
  }
})
</script>
<style lang="stylus">
#builderBlockForm
  width 800px
  height 100vh
</style>
