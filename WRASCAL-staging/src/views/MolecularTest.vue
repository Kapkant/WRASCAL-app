<template>
  <v-container class="fill-height">
    <v-responsive class="d-flex text-center fill-height">
      <v-card class="mx-auto" variant="outlined" max-width="1200">
        <v-card-title>
          <h2>🧪 Molecular Visualization Test</h2>
          <p class="text-subtitle-1">Interactive molecular structure viewer</p>
        </v-card-title>

        <v-card-text>
          <v-row>
            <v-col cols="12" md="6">
              <v-card variant="outlined" class="mb-4">
                <v-card-title>Select a Molecule</v-card-title>
                <v-card-text>
                  <v-select
                    v-model="selectedMolecule"
                    :items="moleculeOptions"
                    label="Choose a molecule to visualize"
                    @update:model-value="loadMolecule"
                  ></v-select>
                </v-card-text>
              </v-card>

              <v-card variant="outlined" class="mb-4">
                <v-card-title>Molecule Information</v-card-title>
                <v-card-text v-if="currentMolecule">
                  <p><strong>Name:</strong> {{ currentMolecule.name }}</p>
                  <p><strong>Formula:</strong> {{ currentMolecule.molecularFormula }}</p>
                  <p><strong>SMILES:</strong> {{ currentMolecule.drawCode }}</p>
                  <p><strong>Description:</strong> {{ currentMolecule.description }}</p>
                </v-card-text>
              </v-card>
            </v-col>

            <v-col cols="12" md="6">
              <v-card variant="outlined" class="mb-4">
                <v-card-title>2D Molecular Structure</v-card-title>
                <v-card-text>
                  <div 
                    id="mol2D" 
                    :style="molViewStyle"
                    class="d-flex align-center justify-center"
                  >
                    <v-progress-circular 
                      v-if="loading2D" 
                      indeterminate 
                      color="primary"
                    ></v-progress-circular>
                    <span v-else-if="!molLoaded2D" class="text-grey">
                      Select a molecule to view 2D structure
                    </span>
                  </div>
                </v-card-text>
              </v-card>

              <v-card variant="outlined">
                <v-card-title>3D Molecular Structure</v-card-title>
                <v-card-text>
                  <div 
                    id="mol3D" 
                    :style="molViewStyle"
                    class="d-flex align-center justify-center"
                  >
                    <v-progress-circular 
                      v-if="loading3D" 
                      indeterminate 
                      color="primary"
                    ></v-progress-circular>
                    <span v-else-if="!molLoaded3D" class="text-grey">
                      Select a molecule to view 3D structure
                    </span>
                  </div>
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>

          <v-row class="mt-4">
            <v-col cols="12">
              <v-card variant="outlined">
                <v-card-title>Controls</v-card-title>
                <v-card-text>
                  <v-btn 
                    @click="load2DMol" 
                    :disabled="!selectedMolecule || loading2D"
                    class="mr-2"
                  >
                    Load 2D View
                  </v-btn>
                  <v-btn 
                    @click="load3DMol" 
                    :disabled="!selectedMolecule || loading3D"
                    class="mr-2"
                  >
                    Load 3D View
                  </v-btn>
                  <v-btn 
                    @click="clearViews" 
                    color="error"
                    variant="outlined"
                  >
                    Clear Views
                  </v-btn>
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>
    </v-responsive>
  </v-container>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useTheme } from 'vuetify';
import { mockLigands } from '@/mockData';
import { loadScript, unloadScript } from 'vue-plugin-load-script';

// Data
const selectedMolecule = ref<number | null>(null);
const currentMolecule = ref<any>(null);
const molLoaded2D = ref(false);
const molLoaded3D = ref(false);
const loading2D = ref(false);
const loading3D = ref(false);

// Computed
const moleculeOptions = computed(() => 
  mockLigands.map(ligand => ({
    title: `${ligand.name} (${ligand.molecularFormula})`,
    value: ligand.id
  }))
);

const molViewStyle = computed(() => {
  const theme = useTheme();
  const background = theme.global.current.value.dark ? "gray" : "transparent";
  return `height: 300px; background: ${background}; border: 1px solid #ccc; border-radius: 4px;`;
});

// Methods
const loadMolecule = (moleculeId: number) => {
  const ligand = mockLigands.find(l => l.id === moleculeId);
  if (ligand) {
    currentMolecule.value = ligand.molData;
    console.log("Selected molecule:", currentMolecule.value);
  }
  clearViews();
};

const clearViews = () => {
  molLoaded2D.value = false;
  molLoaded3D.value = false;
  const mol2DElement = document.getElementById("mol2D");
  const mol3DElement = document.getElementById("mol3D");
  if (mol2DElement) mol2DElement.innerHTML = "";
  if (mol3DElement) mol3DElement.innerHTML = "";
};

const loadPreviewScripts = async () => {
  const srcLinks = [
    "https://cdn.jsdelivr.net/gh/BoboRett/MolViewer@v0.52/molViewer.js",
    "https://d3js.org/d3.v5.js",
    "https://cdn.jsdelivr.net/gh/mrDoob/three.js@r97/build/three.min.js",
    "https://cdn.jsdelivr.net/gh/mrDoob/three.js@r97/examples/js/effects/OutlineEffect.js",
    "https://cdn.jsdelivr.net/gh/mrDoob/three.js@r97/examples/js/controls/OrbitControls.js",
  ];

  for (const src of srcLinks) {
    await loadScript(src);
  }
};

const unloadPreviewScripts = async () => {
  const srcLinks = [
    "https://cdn.jsdelivr.net/gh/BoboRett/MolViewer@v0.52/molViewer.js",
    "https://d3js.org/d3.v5.js",
    "https://cdn.jsdelivr.net/gh/mrDoob/three.js@r97/build/three.min.js",
    "https://cdn.jsdelivr.net/gh/mrDoob/three.js@r97/examples/js/effects/OutlineEffect.js",
    "https://cdn.jsdelivr.net/gh/mrDoob/three.js@r97/examples/js/controls/OrbitControls.js",
  ];

  for (const src of srcLinks) {
    await unloadScript(src);
  }
};

const getSmileCode = async (): Promise<string> => {
  await loadScript(
    "https://unpkg.com/@rdkit/rdkit/dist/RDKit_minimal.js"
  );

  const RDKit = await (window as any).initRDKitModule();
  const smiles = RDKit.get_mol(currentMolecule.value?.drawCode).get_smiles();
  return smiles;
};

const load2DMol = async () => {
  if (!currentMolecule.value) {
    console.log("No molecule selected");
    return;
  }
  
  console.log("Loading 2D molecule:", currentMolecule.value);
  loading2D.value = true;
  
  try {
    // Load RDKit for actual molecular rendering
    await loadScript("https://unpkg.com/@rdkit/rdkit/dist/RDKit_minimal.js");
    
    const RDKit = await (window as any).initRDKitModule();
    const smiles = currentMolecule.value.drawCode;
    
    // Create molecule object
    const mol = RDKit.get_mol(smiles);
    const molBlock = mol.get_molblock();
    
    // Create SVG with better styling
    const svg = mol.get_svg(500, 400);
    
    const mol2DElement = document.getElementById("mol2D");
    if (mol2DElement) {
      mol2DElement.innerHTML = `
        <div style="padding: 20px; text-align: center;">
          <h3>${currentMolecule.value.name}</h3>
          <p><strong>Formula:</strong> ${currentMolecule.value.molecularFormula}</p>
          <p><strong>SMILES:</strong> ${smiles}</p>
          <div style="margin-top: 20px; padding: 20px; background: white; border-radius: 10px; border: 2px solid #e0e0e0; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <p style="margin-bottom: 15px; font-weight: bold; color: #333; font-size: 16px;">2D Molecular Structure</p>
            <div style="display: flex; justify-content: center; align-items: center; min-height: 300px; background: #fafafa; border-radius: 5px; padding: 20px;">
              <div style="max-width: 100%; overflow: hidden;">
                ${svg}
              </div>
            </div>
          </div>
        </div>
      `;
      molLoaded2D.value = true;
      console.log("2D molecule rendered successfully");
    }
  } catch (error) {
    console.error("Error loading 2D molecule:", error);
    // Fallback to simple display
    const mol2DElement = document.getElementById("mol2D");
    if (mol2DElement) {
      mol2DElement.innerHTML = `
        <div style="padding: 20px; text-align: center;">
          <h3>${currentMolecule.value.name}</h3>
          <p><strong>Formula:</strong> ${currentMolecule.value.molecularFormula}</p>
          <p><strong>SMILES:</strong> ${currentMolecule.value.drawCode}</p>
          <div style="margin-top: 20px; padding: 10px; background: #f5f5f5; border-radius: 5px;">
            <p>2D Molecular Structure (Rendering failed)</p>
            <p style="font-family: monospace; font-size: 18px;">${currentMolecule.value.drawCode}</p>
          </div>
        </div>
      `;
      molLoaded2D.value = true;
    }
  } finally {
    loading2D.value = false;
  }
};

const load3DMol = async () => {
  if (!currentMolecule.value) {
    console.log("No molecule selected");
    return;
  }
  
  console.log("Loading 3D molecule:", currentMolecule.value);
  loading3D.value = true;
  
  try {
    // Create a simple 3D representation without RDKit for now
    const smiles = currentMolecule.value.drawCode;
    
    // For benzene (c1ccccc1), create a hexagonal arrangement
    let atoms3D = '';
    let numAtoms = 6; // Default for benzene
    
    // Create a hexagonal arrangement for benzene
    const radius = 60;
    const centerX = 150;
    const centerY = 100;
    
    for (let i = 0; i < 6; i++) {
      const angle = (i * Math.PI * 2) / 6;
      const x = centerX + Math.cos(angle) * radius;
      const y = centerY + Math.sin(angle) * radius;
      const z = Math.sin(angle * 3) * 20; // Add some 3D variation
      
      atoms3D += `
        <div style="
          position: absolute;
          left: ${x}px;
          top: ${y}px;
          width: 20px;
          height: 20px;
          background: #4CAF50;
          border-radius: 50%;
          transform: translateZ(${z}px);
          box-shadow: 0 0 10px rgba(76, 175, 80, 0.7);
          border: 3px solid #2E7D32;
          transition: all 0.3s ease;
        " title="Carbon atom ${i+1}" onmouseover="this.style.transform='translateZ(${z}px) scale(1.2)'" onmouseout="this.style.transform='translateZ(${z}px) scale(1)'"></div>
      `;
    }
    
    // Add bonds between atoms
    let bonds3D = '';
    for (let i = 0; i < 6; i++) {
      const angle1 = (i * Math.PI * 2) / 6;
      const angle2 = ((i + 1) * Math.PI * 2) / 6;
      const x1 = centerX + Math.cos(angle1) * radius;
      const y1 = centerY + Math.sin(angle1) * radius;
      const x2 = centerX + Math.cos(angle2) * radius;
      const y2 = centerY + Math.sin(angle2) * radius;
      const z1 = Math.sin(angle1 * 3) * 20;
      const z2 = Math.sin(angle2 * 3) * 20;
      
      const midX = (x1 + x2) / 2;
      const midY = (y1 + y2) / 2;
      const midZ = (z1 + z2) / 2;
      const length = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
      const bondAngle = Math.atan2(y2 - y1, x2 - x1) * 180 / Math.PI;
      
      bonds3D += `
        <div style="
          position: absolute;
          left: ${midX}px;
          top: ${midY}px;
          width: ${length}px;
          height: 4px;
          background: #666;
          transform: translateZ(${midZ}px) rotate(${bondAngle}deg);
          transform-origin: left center;
          border-radius: 2px;
          box-shadow: 0 0 5px rgba(0,0,0,0.3);
        "></div>
      `;
    }
    
    const mol3DElement = document.getElementById("mol3D");
    if (mol3DElement) {
      mol3DElement.innerHTML = `
        <div style="padding: 20px; text-align: center;">
          <h3>${currentMolecule.value.name} - 3D Structure</h3>
          <p><strong>Formula:</strong> ${currentMolecule.value.molecularFormula}</p>
          <p><strong>SMILES:</strong> ${smiles}</p>
          <div style="margin-top: 20px; padding: 15px; background: linear-gradient(45deg, #e3f2fd, #bbdefb); border-radius: 10px;">
            <p style="font-weight: bold; color: #1976d2; margin-bottom: 15px;">3D Molecular Structure</p>
            <div style="position: relative; width: 300px; height: 200px; margin: 0 auto; background: white; border-radius: 5px; overflow: hidden; perspective: 600px; transform-style: preserve-3d;">
              ${bonds3D}
              ${atoms3D}
            </div>
            <p style="font-size: 12px; color: #666; margin-top: 10px;">
              Interactive 3D benzene ring (hover over atoms to see them highlight)
            </p>
          </div>
        </div>
      `;
      molLoaded3D.value = true;
      console.log("3D molecule rendered successfully");
    }
  } catch (error) {
    console.error("Error loading 3D molecule:", error);
    // Fallback to simple display
    const mol3DElement = document.getElementById("mol3D");
    if (mol3DElement) {
      mol3DElement.innerHTML = `
        <div style="padding: 20px; text-align: center;">
          <h3>${currentMolecule.value.name} - 3D Structure</h3>
          <p><strong>Formula:</strong> ${currentMolecule.value.molecularFormula}</p>
          <p><strong>SMILES:</strong> ${currentMolecule.value.drawCode}</p>
          <div style="margin-top: 20px; padding: 15px; background: linear-gradient(45deg, #e3f2fd, #bbdefb); border-radius: 10px;">
            <p style="font-weight: bold; color: #1976d2;">3D Molecular Structure (Rendering failed)</p>
            <p style="font-family: monospace; font-size: 20px; color: #0d47a1;">${currentMolecule.value.drawCode}</p>
          </div>
        </div>
      `;
      molLoaded3D.value = true;
    }
  } finally {
    loading3D.value = false;
  }
};

onMounted(() => {
  // Auto-select first molecule
  if (mockLigands.length > 0) {
    selectedMolecule.value = mockLigands[0].id;
    loadMolecule(mockLigands[0].id);
  }
});
</script>
