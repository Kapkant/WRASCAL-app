<template>
    <h2>Literature</h2>
    <v-row class="pt-8">
        <v-col cols="12" md="6">
            <v-text-field
                label="Literature Reference"
                prepend-icon="mdi-book-open-page-variant"
                variant="solo"
                :loading="isLoading ?? false"
                @change="entry('litref', litref)"
                v-model:model-value="litref"
            ></v-text-field>
        </v-col>
        <v-col cols="12" md="6">
            <v-text-field
                label="Literature Code"
                prepend-icon="mdi-book-open-page-variant"
                variant="solo"
                :loading="isLoading ?? false"
                @change="entry('litcode', litcode)"
                v-model:model-value="litcode"
            ></v-text-field>
        </v-col>
    </v-row>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
    name: "LiteraturesInfo",
    props: {
        isLoading: {
            type: Boolean,
            default: false
        }
    },
    data: () => ({
        litref: '',
        litcode: ''
    }),
    methods: {
        entry(fieldToChange: String, dataToSend: any) {
            this.$emit('entry', {'fieldToChange': fieldToChange, 'dataToSend': dataToSend})
        }
    }
})
</script>
