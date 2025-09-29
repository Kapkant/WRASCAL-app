<template>
    <h2>Equilibrium Expression</h2>
    <v-row class="pt-8">
      <v-col cols="12" md="6">
        <v-text-field
          label="Expression String"
          prepend-icon="mdi-gold"
          variant="solo"
          :loading="isLoading ?? false"
          @change="entry('expression_string', expressionString)"
          v-model:model-value="expressionString"
        ></v-text-field>
      </v-col>
      <!-- Add fields for products and reactants if necessary -->
      <v-col cols="12" md="6">
        <!-- Products -->
        <v-text-field
          label="Products"
          prepend-icon="mdi-gold"
          variant="solo"
          :loading="isLoading ?? false"
          @change="entry('products', products)"
          v-model:model-value="products"
        ></v-text-field>
        <!-- Reactants -->
        <v-text-field
          label="Reactants"
          prepend-icon="mdi-gold"
          variant="solo"
          :loading="isLoading ?? false"
          @change="entry('reactants', reactants)"
          v-model:model-value="reactants"
        ></v-text-field>
      </v-col>
    </v-row>
  </template>

  <script lang="ts">
  import { defineComponent } from 'vue';

  export default defineComponent ({
      name: "EquilibriumExpressionInfo",
      props: {
          isLoading: {
              type: Boolean,
              default: false
          }
      },
      data: () => ({
          expressionString: '', // Define additional properties if needed
          products: [], // Define products array
          reactants: [] // Define reactants array
      }),
      methods: {
          entry(fieldToChange: String, dataToSend: any) {
              this.$emit('entry', {'fieldToChange': fieldToChange, 'dataToSend': dataToSend})
          }
      }
  })
  </script>
