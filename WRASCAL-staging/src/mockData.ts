// Mock data for testing molecular visualization without database
export interface MockMolData {
  drawCode: string;
  molecularFormula: string;
  name: string;
  description: string;
}

export interface MockLigandData {
  id: number;
  name: string;
  molecularFormula: string;
  molData: MockMolData;
}

export const mockLigands: MockLigandData[] = [
  {
    id: 1,
    name: "Ethanol",
    molecularFormula: "C₂H₆O",
    molData: {
      drawCode: "CCO",
      molecularFormula: "C₂H₆O",
      name: "Ethanol",
      description: "Simple alcohol molecule for testing"
    }
  },
  {
    id: 2,
    name: "Benzene",
    molecularFormula: "C₆H₆",
    molData: {
      drawCode: "c1ccccc1",
      molecularFormula: "C₆H₆",
      name: "Benzene",
      description: "Aromatic ring structure"
    }
  },
  {
    id: 3,
    name: "Caffeine",
    molecularFormula: "C₈H₁₀N₄O₂",
    molData: {
      drawCode: "CN1C=NC2=C1C(=O)N(C(=O)N2C)C",
      molecularFormula: "C₈H₁₀N₄O₂",
      name: "Caffeine",
      description: "Complex heterocyclic compound"
    }
  },
  {
    id: 4,
    name: "Aspirin",
    molecularFormula: "C₉H₈O₄",
    molData: {
      drawCode: "CC(=O)OC1=CC=CC=C1C(=O)O",
      molecularFormula: "C₉H₈O₄",
      name: "Aspirin",
      description: "Common pharmaceutical compound"
    }
  },
  {
    id: 5,
    name: "Glucose",
    molecularFormula: "C₆H₁₂O₆",
    molData: {
      drawCode: "C([C@@H]1[C@H]([C@@H]([C@H]([C@H](O1)O)O)O)O)O",
      molecularFormula: "C₆H₁₂O₆",
      name: "Glucose",
      description: "Simple sugar molecule"
    }
  }
];

export const mockConstants = [
  {
    ligandId: 1,
    metalId: 1,
    value: 1.85,
    uncertainty: 0.05,
    conditions: "25°C, 0.1M NaCl",
    reference: "Test Reference 1"
  },
  {
    ligandId: 2,
    metalId: 1,
    value: 2.34,
    uncertainty: 0.08,
    conditions: "25°C, 0.1M NaCl",
    reference: "Test Reference 2"
  }
];

export const mockReferences = [
  {
    id: 1,
    title: "Test Reference 1",
    authors: "Smith, J. et al.",
    journal: "Journal of Test Chemistry",
    year: 2023,
    doi: "10.1000/test.1"
  },
  {
    id: 2,
    title: "Test Reference 2", 
    authors: "Johnson, A. et al.",
    journal: "Test Chemical Society",
    year: 2023,
    doi: "10.1000/test.2"
  }
];

// Helper function to get mock data by ID
export function getMockLigandById(id: number): MockLigandData | undefined {
  return mockLigands.find(ligand => ligand.id === id);
}

export function getMockConstants(ligandId: number, metalId: number) {
  return mockConstants.filter(constant => 
    constant.ligandId === ligandId && constant.metalId === metalId
  );
}

export function getMockReferences(ligandId: number) {
  return mockReferences;
}

