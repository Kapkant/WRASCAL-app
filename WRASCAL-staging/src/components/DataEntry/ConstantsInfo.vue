<template>
    <h2>Constants</h2>
    <v-row class="pt-8">
      <v-col cols="12" md="6">
        <v-text-field
          label="Constants Value"
          prepend-icon="mdi-numeric"
          variant="solo"
          :loading="isLoading ?? false"
          @change="entry('constants_value', constants_value)"
          v-model:model-value="constants_value"
        ></v-text-field>
      </v-col>
      <v-col cols="12" md="6">
        <v-text-field
          label="Significant Figures"
          prepend-icon="mdi-numeric"
          variant="solo"
          :loading="isLoading ?? false"
          @change="entry('constants_significant_figures', constants_significant_figures)"
          v-model:model-value="constants_significant_figures"
        ></v-text-field>
      </v-col>
    </v-row>
  </template>

  <script lang="ts">
  import { defineComponent } from 'vue'

  export default defineComponent({
    name: 'ConstantsInfo',
    props: {
      isLoading: {
        type: Boolean,
        default: false
      },
      constants_value: {
        type: Number,
        default: 0
      },
      constants_significant_figures: {
        type: Number,
        default: 0
      }
    },
    data: () => ({
      constants_value: 0,
      constants_significant_figures: 0
    }),
    methods: {
      entry(fieldToChange: string, dataToSend: any) {
        this.$emit('entry', { fieldToChange, dataToSend })
      }
    }
  })
  </script>
