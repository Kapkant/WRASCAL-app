<template>
    <h2>Ligand</h2>
    <v-row class="pt-8">
        <!-- Ligand Name -->
        <v-col cols="12" md="6">
            <v-text-field
                label="Ligand Name"
                prepend-icon="mdi-gold"
                variant="solo"
                :loading="isLoading ?? false"
                @change="entry('ligand_name', ligand_name)"
                v-model:model-value="ligand_name"
            ></v-text-field>
        </v-col>

        <!-- Ligand Form Protonation -->
        <v-col cols="12" md="6">
            <v-text-field
                label="Ligand Form Protonation"
                prepend-icon="mdi-gold"
                variant="solo"
                :loading="isLoading ?? false"
                @change="entry('ligand_form_protonation', ligand_form_protonation)"
                v-model:model-value="ligand_form_protonation"
            ></v-text-field>
        </v-col>

        <!-- Ligand Form Charge -->
        <v-col cols="12" md="6">
            <v-text-field
                label="Ligand Form Charge"
                prepend-icon="mdi-gold"
                variant="solo"
                :loading="isLoading ?? false"
                @change="entry('ligand_form_charge', ligand_form_charge)"
                v-model:model-value="ligand_form_charge"
            ></v-text-field>
        </v-col>

        <!-- Ligand Formula -->
        <v-col cols="12" md="6">
            <ChemInput
            :name="ligand_molecular_formula_name"
            :length="ligand_molecular_formula_width"
            @compute-formula="entry('ligand_molecular_formula', $event)"
            @compute-charge="entry('ligand_charge', $event)"/>
        </v-col>

        <!-- Ligand Charge -->
        <v-col cols="12" md="6">
            <v-text-field
                label="Ligand Charge"
                prepend-icon="mdi-gold"
                variant="solo"
                :loading="isLoading ?? false"
                @change="entry('ligand_charge', ligand_charge)"
                v-model:model-value="ligand_charge"
            ></v-text-field>
        </v-col>

        <!-- Ligand Categories -->
        <v-col cols="12" md="6">
            <v-text-field
                label="Ligand Categories"
                prepend-icon="mdi-gold"
                variant="solo"
                :loading="isLoading ?? false"
                @change="entry('ligand_categories', ligand_categories)"
                v-model:model-value="ligand_categories"
            ></v-text-field>
        </v-col>
    </v-row>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import ChemInput from './ChemInput.vue';

export default defineComponent ({
    name: "LigandInfo",
    props: {
        isLoading: {
            type: Boolean,
            default: false
        }
    },
    components: {ChemInput},
    data: () => ({
        ligand_name: '',
        molecular_formula_charge: '',
        ligand_form_protonation: '',
        ligand_form_charge: '',
        ligand_molecular_formula: '',
        ligand_charge: '',
        ligand_categories: '',
        ligand_molecular_formula_name: 'Ligand Molecular Formula',
        ligand_molecular_formula_width: "300px",
    }),
    methods: {
        entry(fieldToChange: String, dataToSend: any) {
            this.$emit('entry', {'fieldToChange': fieldToChange, 'dataToSend': dataToSend})
            // console.log(fieldToChange, dataToSend)
        }
    }
})
</script>
