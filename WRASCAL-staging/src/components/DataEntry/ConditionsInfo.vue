<template>
    <h2> Conditions</h2>
    <v-row class="pt-8">
        <v-col
        cols="12"
        md="3"
        >
        <!-- Ideally this field eventually becomes a dropdown. There's a finite number of them. -->
        <v-text-field
            label="Constant Kind"
            prepend-icon="mdi-gold"
            variant="solo"
            :loading="isLoading ?? false"
            @change="entry('conditions_constant_kind', constant_kind)"
            v-model:model-value="constant_kind"
        ></v-text-field>
        </v-col>
        <v-col
        cols="12"
        md="3"
        >
        <v-text-field
            label="Temperature"
            prepend-icon="mdi-gold"
            variant="solo"
            :loading="isLoading ?? false"
            @input="entry('conditions_temperature', temperature)"
            v-model:model-value="temperature"
            type="number"
        ></v-text-field>
        </v-col>
        <v-col
        cols="12"
        md="3"
        >
        <v-checkbox
            label="Temperature Varies?"
            @input="entry('conditions_temperature_varies', temperature_varies)"
            v-model:model-value="temperature_varies"
        ></v-checkbox>
        </v-col>
        <v-col
        cols="12"
        md="3"
        >
        <v-text-field
            label="Ionic Strength"
            prepend-icon="mdi-gold"
            variant="solo"
            :loading="isLoading ?? false"
            @change="entry('conditions_ionic_strength', ionic_strength)"
            v-model:model-value="ionic_strength"
            type="number"
        ></v-text-field>
        </v-col>
    </v-row>
</template>

<script lang="ts">
import ProtonationDisplayUtil from '@/utils/ProtonationDisplayUtil';
import { defineComponent } from 'vue';

export default defineComponent ({
    name: "ConditionsInfo",
    props: { // matches columns of table in database
        isLoading: {
            type: Boolean,
            default: false
        }
    },
    data: () => ({
        constant_kind: '',
        temperature: '',
        temperature_varies: false,
        ionic_strength: '',
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
