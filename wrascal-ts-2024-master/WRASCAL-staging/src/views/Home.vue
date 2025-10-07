<template>
  <v-container class="fill-height">
    <v-responsive class="d-flex align-center text-center fill-height">
      <div class="text-left text-h2">WRASCAL</div>
      <div class="text-left text-h6 pl-2">Whitman Repository of Accepted Stability Constants of Aqueous Ligands</div>
      <SimpleSearchForm v-if="isSimpleSearch" v-model:ligands="this.ligands" :is-loading="isLoading" @onSearch="searchLigands"/>
      <AdvanceSearchForm v-else
                         :is-loading="isLoading"
                         v-model:ligands="this.ligands"
                         v-model:metals="this.metals"
                         v-model:categories="this.categories"
                         v-model:chemicals="this.chemicals"
                         v-model:ligand-charges="this.ligandCharges"
                         v-model:metal-charges="this.metalCharges"
                         @onSearch="searchLigands"/>
      <div class="d-flex justify-end mb-6 pt-5">
        <v-btn
          variant="text"
          color="primary"
          append-icon="mdi-arrow-right"
          @click="switchSearchMode"
        >
          {{searchOptionSwitchButtonContent}}
        </v-btn>
      </div>
      <v-snackbar
        v-model="snackbar"
        multi-line
        color="error"
      >
        {{ text }}

        <template v-slot:actions>
          <v-btn
            color="red"
            variant="text"
            @click="snackbar = false"
          >
            Close
          </v-btn>
        </template>
      </v-snackbar>
    </v-responsive>
  </v-container>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import {useTheme} from "vuetify";
import SimpleSearchForm from "@/components/Search/SimpleSearchForm.vue";
import {SearchRequestModel} from "@/models/AdvanceSearchRequestModel";
import AdvanceSearchForm from "@/components/Search/AdvanceSearchForm.vue";
import {advanceSearch, simpleSearch} from "@/axiosClient";
import {searchResultStore} from "@/stores/searchResultStore";
import {useMeta} from "vue-meta";

export default defineComponent({
  name: 'home',
  setup: () => {
    useMeta({
      title: 'Home'
    })
  },
  components: {AdvanceSearchForm, SimpleSearchForm},
  data: () => ({
    isSimpleSearch: true,
    isLoading: false,
    snackbar: false,
    text: 'Failed to fetch search result from the server. Please try again.',
    ligands: '',
    metals: '',
    categories: '',
    ligandCharges: '',
    metalCharges: '',
    chemicals: ''
  }),
  computed: {
    nistIconStyle(): string{
      const theme = useTheme()

      return theme.global.current.value.dark ? 'filter: invert(0%);' : 'filter: invert(100%);'
    },
    searchOptionSwitchButtonContent(): string{
      return this.isSimpleSearch ? 'Advanced Search' : 'Simple Search'
    }
  },
  methods: {
    switchSearchMode(){
      this.isSimpleSearch = !this.isSimpleSearch
    },
    async searchLigands() {
      try {
        this.isLoading = true
        const store = searchResultStore()
        const form = new SearchRequestModel(this.ligands, this.metals, this.categories, this.ligandCharges, this.metalCharges, this.chemicals);

        if(form.onlyHasLigands()){
          const result = await simpleSearch(form.ligands?.split(',') ?? [])
          if(!result){
            this.text = 'No results found.'
            this.snackbar = true
            return
          }
          store.searchResult = result
          store.setLastQuery((form.ligands?.split(',') ?? [])[0] ?? '')
          this.$router.push('/search-result')
        }
        else{
          const result = await advanceSearch(form.getRequestModel())
          if(!result){
            this.text = 'No results found.'
            this.snackbar = true
            return
          }
          store.searchResult = result
          store.setLastQuery(form.getRequestModel().ligands?.[0] ?? '')
          this.$router.push('/search-result')
        }
      } catch (e) {
        this.text = 'Search failed. Please check your input or try again.'
        this.snackbar = true
      } finally {
        this.isLoading = false
      }
    }
  }
})

</script>
