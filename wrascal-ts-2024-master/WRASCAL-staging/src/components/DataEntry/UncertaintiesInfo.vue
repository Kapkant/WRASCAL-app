<template>
    <h2>Uncertainties</h2>
    <v-row class="pt-8">
        <v-col cols="12" md="6">
            <v-text-field
                label="Direction"
                prepend-icon="mdi-information-outline"
                variant="solo"
                :loading="isLoading ?? false"
                @change="entry('direction', direction)"
                v-model:model-value="direction"
            ></v-text-field>
        </v-col>
        <v-col cols="12" md="6">
            <v-text-field
                label="Magnitude"
                prepend-icon="mdi-information-outline"
                variant="solo"
                :loading="isLoading ?? false"
                @change="entry('magnitude', magnitude)"
                v-model:model-value="magnitude"
            ></v-text-field>
        </v-col>
    </v-row>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
    name: "UncertaintiesInfo",
    props: {
        isLoading: {
            type: Boolean,
            default: false
        }
    },
    data: () => ({
        direction: '',
        magnitude: 0
    }),
    methods: {
        entry(fieldToChange: String, dataToSend: any) {
            this.$emit('entry', {'fieldToChange': fieldToChange, 'dataToSend': dataToSend})
        }
    }
})
</script>
