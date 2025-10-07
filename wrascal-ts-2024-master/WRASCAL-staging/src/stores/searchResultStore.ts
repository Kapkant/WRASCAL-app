import { defineStore } from 'pinia'
import {
  LigandSearchResultModel,
  ProcessedLigandAdvanceSearchResultModel
} from "@/models/LigandSearchResultModel";

export const searchResultStore = defineStore('searchResult', {
  state: () => ({
    searchResult: [] as LigandSearchResultModel[],
    selectedSearchResult: new ProcessedLigandAdvanceSearchResultModel() as ProcessedLigandAdvanceSearchResultModel,
    lastQuery: '' as string
  }),
  getters: {
    getKeys(): string[]{
      return Object.keys(new ProcessedLigandAdvanceSearchResultModel())
    }
  },
  actions: {
    setLastQuery(q: string){
      this.lastQuery = q || ''
    }
  }
})
