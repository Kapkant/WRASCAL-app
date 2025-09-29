<template>
    <h2>Metal</h2>
        <v-row class="pt-8">

            <v-col
            cols="12"
            md="2"
            >
                <v-text-field
                label="Central Element"
                prepend-icon="mdi-gold"
                variant="solo"
                :loading="isLoading ?? false"
                @change="entry('metal_central_element', metal_central_element)"
                v-model:model-value="metal_central_element"
                ></v-text-field>
            </v-col>
            <v-col
            cols="12"
            md = "2"
            >
                <v-text-field
                label="Charge"
                prepend-icon="mdi-gold"
                variant="solo"
                :loading="isLoading ?? false"
                @change="entry('metal_charge', metal_charge)"
                v-model:model-value="metal_charge"
                ></v-text-field>
            </v-col>
            <v-col
            cols="12"
            md = "6"
            >
                <ChemInput
                :name="formula_string_name"
                :width="formula_string_width"
                @compute-formula="entry('ligand_molecular_formula', $event)"
                @compute-charge="entry('ligand_charge', $event)"/>
            </v-col>
        </v-row>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import ChemInput from './ChemInput.vue';

export default defineComponent ({
    name: "MetalInfo",
    props: {
        isLoading: {
            type: Boolean,
            default: false
        }
    },
    components: {ChemInput},
    data: () => ({
        metal_id: '',
        metal_central_element: '',
        metal_formula_string: '',
        metal_charge: '',
        formula_string_name: 'Formula String',
        formula_string_width: '300px',
    }),
    methods: {
        // Data must be sent as {string, data} because the other end uses javascript tomshittery to
        // interpret fieldToChange as a variable name. I have no idea why this works and I hate
        // it but whatever, it works.
        entry(fieldToChange: String, dataToSend: any) { // listener is in /views/NewEntry.vue
            this.$emit('entry', {'fieldToChange': fieldToChange, 'dataToSend': dataToSend})
        }
    }
})
</script>
