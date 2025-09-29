<template>
  <v-container class="pt-8">
    <v-text-field
      class="pt-10"
      density="compact"
      variant="solo"
      label="Search Ligands"
      append-inner-icon="mdi-magnify"
      append-icon="mdi-close-circle"
      single-line
      hide-details
      v-model:model-value="ligandsValue"
      @input="onLigandsUpdate"
      @click:append-inner="searchLigands"
      @click:append="clearLigands"
      v-on:keyup.enter="searchLigands"
      :loading="isLoading ?? false"
    ></v-text-field>
    <div class="pa-4 text-end">
      <v-btn
        @click="searchLigands"
        class="text-none"
        color="primary"
        min-width="92">
        Search
      </v-btn>
    </div>
  </v-container>
</template>

<script lang="ts">

import { defineComponent } from 'vue'

export default defineComponent({
  name: "SimpleSearchForm",
  props: {
    isLoading: {
      type: Boolean,
      default: false
    },
    ligands: {
      type: String,
      default: ''
    }
  },
  data: () => ({
    ligandsValue: '',
    debounceTimer: undefined as unknown as number
  }),
  methods: {
    searchLigands(){
      this.$emit('onSearch')
    },
    onLigandsUpdate(){
      // debounce update to parent for better UX
      if (this.debounceTimer) window.clearTimeout(this.debounceTimer)
      this.debounceTimer = window.setTimeout(() => {
        this.$emit('update:ligands', this.ligandsValue);
      }, 300)
    },
    clearLigands(){
      this.ligandsValue = ''
      this.$emit('update:ligands', this.ligandsValue);
    }
  }
})

</script>

<style scoped>

</style>
