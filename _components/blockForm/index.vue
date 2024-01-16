<template>
  <div id="builderBlockForm" class="bg-white relative-position">

    <!--Form block-->
    <dynamic-form v-model="dataMainBlock" title="Crea un nuevo Bloque (PT)" no-actions ref="formMain"
                  description="Aqui puedes crear un nuevo bolque (PT)" :blocks="formFields.main" />
    <!--Form Content-->
    <div v-if="contentfieldsconfig.show" class="box box-auto-height q-mb-md">
      <div class="row q-col-gutter-x-md">
        <!--Title-->
        <div class="box-title text-primary q-mb-md">
          {{ $tr('isite.cms.label.content') }}
        </div>
<!--        &lt;!&ndash; Entity Content &ndash;&gt;-->
<!--        <div v-if="contentfieldsconfig.content.length" class="col-12">-->
<!--          <div v-for="(field, key) in formFields.entity.fields" :key="key"-->
<!--               :class="field.colClass || field.columns || 'col-12 col-md-6'">-->
<!--            <dynamic-field v-model="formEntity[field.name || key]" :key="key" :field="field"-->
<!--                           v-if="field.vIf !== undefined ? field.vIf : true" :item-id="blockId"/>-->
<!--          </div>-->
<!--        </div>-->
<!--        &lt;!&ndash; Form Content Fields &ndash;&gt;-->
<!--        <div class="col-12 no-child-box">-->
<!--          <dynamic-form v-if="contentfieldsconfig.contentFields.length" :box-style="false"-->
<!--                        v-model="formContentFields" :blocks="contentfieldsconfig.contentFields"-->
<!--                        ref="formContentFields" formType="grid" no-actions/>-->
<!--        </div>-->
      </div>
    </div>

    <div class="box box-auto-height text-right">
      <q-btn unelevated rounded no-caps type="submit" :label="$tr('isite.cms.label.save')"
             color="green" @click="() => submitData()"/>
    </div>
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
