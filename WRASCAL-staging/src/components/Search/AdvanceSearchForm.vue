<template>
  <v-container class="pt-8">
    <v-alert
      border="start"
      variant="tonal"
      type="info"
      closable
      close-label="Close Alert"
      title="Advanced Search Tips"
      class="text-left"
    >
      All the fields below support multiple entries, you can input one or more entries split by: <b>,</b>
      For example: Fe, H, Ca
    </v-alert>

    <v-row class="pt-8">
      <v-col
        cols="12"
        md="12"
      >
        <v-text-field
          label="Categories"
          prepend-icon="mdi-list-box-outline"
          variant="solo"
          :loading="isLoading ?? false"
          @input="onCategoriesUpdate"
          v-model:model-value="categoriesValue"
        ></v-text-field>
      </v-col>

      <v-col
        cols="12"
        md="12"
      >
        <v-text-field
          label="Ligands"
          prepend-icon="mdi-chemical-weapon"
          variant="solo"
          :loading="isLoading ?? false"
          @input="onLigandsUpdate"
          v-model:model-value="ligandsValue"
        ></v-text-field>
      </v-col>

      <v-col
        cols="12"
        md="12"
      >
        <v-text-field
          label="Chemicals"
          prepend-icon="mdi-bottle-tonic-skull-outline"
          variant="solo"
          :loading="isLoading ?? false"
          @input="onChemicalsUpdate"
          v-model:model-value="chemicalsValue"
        ></v-text-field>
      </v-col>

      <v-col
        cols="12"
        md="4"
      >
        <v-text-field
          label="Metals"
          prepend-icon="mdi-soldering-iron"
          variant="solo"
          :loading="isLoading ?? false"
          @input="onMetalsUpdate"
          v-model:model-value="metalsValue"
        ></v-text-field>
      </v-col>

      <v-col
        cols="12"
        md="4"
      >
        <v-text-field
          label="Metal Charge"
          prepend-icon="mdi-flash"
          variant="solo"
          :loading="isLoading ?? false"
          @input="onMetalChargesUpdate"
          v-model:model-value="metalChargesValue"
        ></v-text-field>
      </v-col>

      <v-col
        cols="12"
        md="4"
      >
        <v-text-field
          label="Ligand Charge"
          prepend-icon="mdi-lightning-bolt-outline"
          variant="solo"
          :loading="isLoading ?? false"
          @input="onLigandChargesUpdate"
          v-model:model-value="ligandChargesValue"
        ></v-text-field>
      </v-col>
    </v-row>

    <v-btn type="submit" block class="mt-2" color="primary" @click="searchLigands">Submit</v-btn>
  </v-container>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  name: "AdvanceSearchForm",
  props: {
    isLoading: {
      type: Boolean,
      default: false
    },
    ligands: {
      type: String,
      default: ''
    },
    metals: {
      type: String,
      default: ''
    },
    categories: {
      type: String,
      default: ''
    },
    ligandCharges: {
      type: String,
      default: ''
    },
    metalCharges: {
      type: String,
      default: ''
    },
    chemicals: {
      type: String,
      default: ''
    }
  },
  data: () => ({
    ligandsValue: '',
    metalsValue: '',
    categoriesValue: '',
    ligandChargesValue: '',
    metalChargesValue: '',
    chemicalsValue: ''
  }),
  methods: {
    searchLigands(){
      this.$emit('onSearch')
    },
    onLigandsUpdate(){
      this.$emit('update:ligands', this.ligandsValue);
    },
    onMetalsUpdate(){
      this.$emit('update:metals', this.metalsValue);
    },
    onCategoriesUpdate(){
      this.$emit('update:categories', this.categoriesValue);
    },
    onLigandChargesUpdate(){
      this.$emit('update:ligandCharges', this.ligandChargesValue);
    },
    onMetalChargesUpdate(){
      this.$emit('update:metalCharges', this.metalChargesValue);
    },
    onChemicalsUpdate(){
      this.$emit('update:chemicals', this.chemicalsValue);
    }
  }
})
</script>
