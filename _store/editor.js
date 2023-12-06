import Vue, {reactive, computed} from 'vue';
import crud from '@imagina/qcrud/_services/baseService.js';
import helper from '@imagina/qsite/_plugins/helper'

//States
const state = reactive({
  panelWidth: '380px'
})

//Model to be able use state as v-model
const models = {}

//Getters
const getters = {}

//Methods
const methods = {}

export default {
  state,
  models,
  getters,
  methods
}
