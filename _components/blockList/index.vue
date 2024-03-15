<template>
  <div id="builderBlockList" class="drawer-body relative-position">
    <!--Buttons actions-->
    <div class="flex q-gutter-xs justify-between">
      <q-btn @click="$emit('create')" outline rounded class="q-mb-sm text-capitalize heigth-button" color="primary"
             no-caps>
        <q-icon size="xs" left name="fa-solid fa-plus" />
        <div class="text-center text-weight-bold">
          {{ $tr('ibuilder.cms.newBlock') }}
        </div>
      </q-btn>
      <q-btn @click="refreshBlocks" outline rounded class="q-mb-sm" size="sm" color="primary"
             no-caps icon="fa-light fa-rotate-right" />
    </div>

    <q-separator spaced />
    <recursive-item id="recursiveItemContent" :translatable="false" :menu="mapBlocks" right-icon />
    <inner-loading :visible="loading" />
  </div>
</template>
<script>
import { defineComponent } from 'vue';
import controller from 'src/modules/qbuilder/_components/blockList/controller';
import recursiveItem from 'src/modules/qsite/_components/v3/recursiveItem';

export default defineComponent({
  props: {},
  components: {
    recursiveItem
  },
  emits: ['refresh', 'selected'],
  setup(props, { emit }) {
    return controller(props, emit);
  }
});
</script>
<style lang="scss">
#builderBlockList {
  &.drawer-body {
    padding: 26px 18px 24px 18px;
  }

  #recursiveItemContent {
    .expansion-header {
      font-weight: bold;
      color: $blue-grey;

      &.item-is-active {
        background: $deep-purple-6;
      }
    }

    .q-expansion-item__content, .expansion-header {
      background: white;
    }

    .q-expansion-item__content {
      padding: 0;
    }

    .expansion-border {
      border: 1px solid #c7c7c7;
      border-radius: 5px;
      overflow: hidden;
      margin-bottom: 10px;
    }

    .element {
      min-height: 58px;
    }

    .content-item:nth-child(odd) {
      background-color: $indigo-1;
    }

    .content-item:nth-child(even) {
      background-color: white;
    }

    .item-is-active {
      background: $blue-8;

      .q-item__label, .q-icon {
        color: white;
      }
    }
  }
}

.q-menu .q-list .q-item {
  padding: 8px 10px;
}
</style>
