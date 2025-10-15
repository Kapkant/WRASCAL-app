// Mock API client for testing without database
import { mockLigands, getMockLigandById, getMockConstants, getMockReferences } from './mockData';
import { LigandSearchResultModel } from '@/models/LigandSearchResultModel';
import { MolDataRawResultModel } from '@/models/MolDataResultModel';
import { ConstantResultModel } from '@/models/ConstantResultModel';
import { ReferenceFetchResultModel } from '@/models/ReferenceFetchResultModel';

// Mock delay to simulate API calls
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export async function mockSimpleSearch(ligands: string[]): Promise<LigandSearchResultModel[] | null> {
  await delay(500); // Simulate API delay
  
  const results: LigandSearchResultModel[] = [];
  
  for (const ligandName of ligands) {
    const mockLigand = mockLigands.find(l => 
      l.name.toLowerCase().includes(ligandName.toLowerCase()) ||
      l.molecularFormula.toLowerCase().includes(ligandName.toLowerCase())
    );
    
    if (mockLigand) {
      results.push({
        id: mockLigand.id,
        name: mockLigand.name,
        molecularFormula: mockLigand.molecularFormula,
        // Add other required fields with mock data
        constants: [],
        references: []
      } as LigandSearchResultModel);
    }
  }
  
  return results.length > 0 ? results : null;
}

export async function mockGetMolData(ligandId: number): Promise<MolDataRawResultModel | null> {
  await delay(300);
  
  const mockLigand = getMockLigandById(ligandId);
  if (!mockLigand) return null;
  
  return {
    drawCode: mockLigand.molData.drawCode,
    molecularFormula: mockLigand.molData.molecularFormula,
    name: mockLigand.molData.name,
    description: mockLigand.molData.description
  } as MolDataRawResultModel;
}

export async function mockGetConstants(ligandId: number, metalId: number): Promise<ConstantResultModel[] | null> {
  await delay(400);
  
  const constants = getMockConstants(ligandId, metalId);
  return constants.map(constant => ({
    value: constant.value,
    uncertainty: constant.uncertainty,
    conditions: constant.conditions,
    reference: constant.reference
  } as ConstantResultModel));
}

export async function mockGetReferences(ligandId: number): Promise<ReferenceFetchResultModel[] | null> {
  await delay(300);
  
  const references = getMockReferences(ligandId);
  return references.map(ref => ({
    id: ref.id,
    title: ref.title,
    authors: ref.authors,
    journal: ref.journal,
    year: ref.year,
    doi: ref.doi
  } as ReferenceFetchResultModel));
}

// Mock advance search
export async function mockAdvanceSearch(searchRequest: any): Promise<any[] | null> {
  await delay(800);
  
  // Return all mock ligands for advance search
  return mockLigands.map(ligand => ({
    id: ligand.id,
    name: ligand.name,
    molecularFormula: ligand.molecularFormula,
    constants: [],
    references: []
  }));
}

