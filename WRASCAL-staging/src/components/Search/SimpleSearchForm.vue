<template>
  <v-container class="pt-8">
    <v-autocomplete
      class="pt-10"
      density="compact"
      variant="solo"
      label="Search Ligands"
      append-inner-icon="mdi-magnify"
      append-icon="mdi-close-circle"
      single-line
      hide-details
      v-model:model-value="ligandsValue"
      :items="searchHistoryItems"
      @input="onLigandsUpdate"
      @click:append-inner="searchLigands"
      @click:append="clearLigands"
      v-on:keyup.enter="searchLigands"
      :loading="isLoading ?? false"
      clearable
    >
      <template v-slot:prepend-item v-if="searchHistory && searchHistory.length > 0">
        <v-list-item
          title="Recent Searches"
          class="text-caption text-grey"
          prepend-icon="mdi-clock-outline"
        ></v-list-item>
        <v-divider></v-divider>
      </template>
      <template v-slot:append-item v-if="searchHistory && searchHistory.length > 0">
        <v-divider></v-divider>
        <v-list-item
          title="Clear History"
          prepend-icon="mdi-delete-outline"
          @click="clearHistory"
          class="text-caption"
        ></v-list-item>
      </template>
    </v-autocomplete>
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
    },
    searchHistory: {
      type: Array as () => string[],
      default: () => []
    }
  },
  emits: ['onSearch', 'update:ligands', 'clear-history'],
  data: () => ({
    ligandsValue: '',
    debounceTimer: undefined as unknown as number
  }),
  computed: {
    searchHistoryItems(): string[] {
      return this.searchHistory || [];
    }
  },
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
    },
    clearHistory() {
      this.$emit('clear-history');
    }
  }
})

</script>

<style scoped>

</style>
