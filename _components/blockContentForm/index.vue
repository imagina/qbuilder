<template>
  <master-modal v-model="showModal"
                :title="`${$tr('ibuilder.cms.label.blockContent')} ${idBlock ? `- ID: ${idBlock}` : ''}`"
                custom-position
                modalWidthSize="650px" :actions="modalActions" :loading="loading">
    <dynamic-form v-model="formBlock" formType="grid" :blocks="formFields" @submit="submitData"
                  no-actions ref="refForm" no-reset-with-blocks-update />
  </master-modal>
</template>
<script lang="ts">
import { defineComponent } from 'vue';
import controller from 'src/modules/qbuilder/_components/blockContentForm/controller';

export default defineComponent({
  props: {},
  components: {},
  setup(props, { emit }) {
    return controller(props, emit);
  }
});
</script>
<style lang="scss">
#builderBlockForm {
  width: 800px;
  height: 100vh;
}
</style>
