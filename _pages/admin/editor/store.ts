import { reactive, computed } from 'vue';
import { Layout } from 'src/modules/qbuilder/_components/layoutList/interface';
import { Block, ModuleBlockConfig } from 'src/modules/qbuilder/_components/blocksPanel/interface';

interface StateProps {
  panelWidth: string,
  layoutSelected: Layout | null
  viewBlockSelected: Block | null
  blockSelected: Block | null
  blockConfigs: ModuleBlockConfig[],
  mainBlockSystemName: string
}

//States
const state = reactive<StateProps>({
  panelWidth: '380px',
  layoutSelected: null,
  viewBlockSelected: null,
  blockSelected: null,
  blockConfigs: [],
  mainBlockSystemName: 'x-ibuilder::block'
});

export default computed(() => ({
  get panelWidth() {
    return state.panelWidth;
  },
  get layoutSelected() {
    return state.layoutSelected;
  },
  set layoutSelected(val) {
    state.layoutSelected = val;
  },
  resetLayoutSelected() {
    state.layoutSelected = null;
  },
  get blockSelected() {
    return state.blockSelected;
  },
  set blockSelected(val) {
    state.blockSelected = val;
  },
  get blockConfigs() {
    return state.blockConfigs;
  },
  set blockConfigs(val) {
    state.blockConfigs = val;
  },
  get mainBlockSystemName() {
    return state.mainBlockSystemName;
  },
  get ignoreConfigKeys() {
    const childKeysConfig = new Set(state.blockConfigs.reduce((acc, current) => {
      return [...Object.keys(current.childBlocks ?? {}), ...acc];
    }, ['componentAttributes']));

    return Array.from(childKeysConfig);
  },
  get viewBlockSelected() {
    return state.viewBlockSelected;
  },
  set viewBlockSelected(val) {
    state.viewBlockSelected = val;
  },
  resetSelecteds() {
    state.layoutSelected = null;
    state.blockSelected = null;
    state.viewBlockSelected = null;
  }
})).value;
