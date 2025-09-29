<template>
    <h2>Footnotes</h2>
    <v-row class="pt-8">
        <v-col cols="12">
            <v-list dense>
                <v-list-item
                    v-for="(note, index) in notes"
                    :key="index"
                >
                    <v-list-item-content>
                        <v-text-field
                            :label="`Note Type (${index + 1})`"
                            v-model:model-value="note.type"
                            @change="entry(`note_type`, note.type)"
                            prepend-icon="mdi-note-outline"
                            variant="solo"
                            :loading="isLoading ?? false"
                        ></v-text-field>
                        <v-text-field
                            :label="`Note Content (${index + 1})`"
                            v-model:model-value="note.content"
                            @change="entry(`note_content`, note.content)"
                            prepend-icon="mdi-note-outline"
                            variant="solo"
                            :loading="isLoading ?? false"
                        ></v-text-field>
                    </v-list-item-content>
                </v-list-item>
            </v-list>
        </v-col>
    </v-row>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
    name: "FootnotesInfo",
    props: {
        isLoading: {
            type: Boolean,
            default: false
        }
    },
    data: () => ({
        notes: [
            { type: '', content: '' },
            { type: '', content: '' }
        ]
    }),
    methods: {
        entry(fieldToChange: String, dataToSend: any) {
            this.$emit('entry', {'fieldToChange': fieldToChange, 'dataToSend': dataToSend});
        }}

      }

)
</script>
