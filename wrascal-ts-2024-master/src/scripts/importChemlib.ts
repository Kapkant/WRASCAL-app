import fs from "fs";
import path from "path";
import { DataSource } from "typeorm";
import { PostgresDataSource } from "../datasources/PostgresDatasource";

type LigandRow = {
  id: number;
  legacy_nist46_id?: number;
  name: string;
  molecular_formula?: string; // e.g. "((C,10),(H,16),(N,2),(O,8),-4)"
  charge?: number;
  form?: string; // e.g. "(0,-4)"
  categories?: string[];
};

type MetalRow = {
  id: number;
  legacy_string?: string;
  central_element: string; // e.g. "Fe"
  formula_string: string; // e.g. "Fe"
  charge: number;
};

type EqExprRow = {
  id: number;
  expression_string: string;
  products: string[]; // e.g. ["(FeEDTA,1)"]
  reactants: string[]; // e.g. ["(Fe3+,1)","(EDTA,1)"]
  legacy_identifier?: string;
};

type FootnoteRow = {
  id: number;
  legacy_identifier?: string;
  // either already formatted like "(Other,\"seed data\")" or as tuple [type, content]
  notes: Array<string | [string, string]>;
};

type ConditionRow = {
  id: number;
  constant_kind: "Equilibrium" | "Enthalpy" | "Entropy";
  temperature: number;
  temperature_varies: boolean;
  ionic_strength: number;
};

type ConstantRow = {
  value: number;
  significant_figures: number;
  ligand_id: number;
  metal_id: number;
  equilibrium_expression_id?: number;
  conditions_id?: number;
  uncertainty_id?: number; // optional; table may not exist in dev
  footnote_id?: number;
};

type ChemlibDataset = {
  ligands?: LigandRow[];
  metals?: MetalRow[];
  equilibrium_expressions?: EqExprRow[];
  footnotes?: FootnoteRow[];
  conditions?: ConditionRow[];
  constants?: ConstantRow[];
};

function getArgValue(flag: string): string | undefined {
  const idx = process.argv.findIndex((a) => a === flag || a.startsWith(flag + "="));
  if (idx === -1) return undefined;
  const exact = process.argv[idx];
  if (exact.includes("=")) return exact.split("=")[1];
  return process.argv[idx + 1];
}

function formatNotesToTextArrayLiteral(notes: FootnoteRow["notes"]): string {
  const parts = notes.map((n) => {
    if (typeof n === "string") return n;
    const [type, content] = n;
    const safeContent = /^[A-Za-z0-9]*$/.test(content) ? `"${content}"` : content;
    return `(${type},${safeContent})`;
  });
  return `{${parts.join(",")}}`;
}

async function insertLigands(ds: DataSource, ligands: LigandRow[]) {
  for (const l of ligands) {
    const categories = l.categories && l.categories.length > 0 ? `{${l.categories.join(",")}}` : "{}";
    const mf = l.molecular_formula ? `'${l.molecular_formula}'` : "NULL";
    const form = l.form ? `'${l.form}'` : "NULL";
    const charge = typeof l.charge === "number" ? l.charge : "NULL";
    const legacy = typeof l.legacy_nist46_id === "number" ? l.legacy_nist46_id : "NULL";
    const sql = `INSERT INTO ligands (id, legacy_nist46_id, name, molecular_formula, charge, form, categories)
VALUES (${l.id}, ${legacy}, '${l.name.replace(/'/g, "''")}', ${mf}, ${charge}, ${form}, '${categories}')
ON CONFLICT DO NOTHING;`;
    await ds.query(sql);
  }
}

async function insertMetals(ds: DataSource, metals: MetalRow[]) {
  for (const m of metals) {
    const legacy = m.legacy_string ? `'${m.legacy_string.replace(/'/g, "''")}'` : "NULL";
    const sql = `INSERT INTO metals (id, legacy_string, central_element, formula_string, charge)
VALUES (${m.id}, ${legacy}, '${m.central_element}', '${m.formula_string}', ${m.charge})
ON CONFLICT DO NOTHING;`;
    await ds.query(sql);
  }
}

async function insertEquilibriumExpressions(ds: DataSource, rows: EqExprRow[]) {
  for (const r of rows) {
    const products = `{${r.products.map((p) => `\"${p}\"`).join(",")}}`;
    const reactants = `{${r.reactants.map((p) => `\"${p}\"`).join(",")}}`;
    const legacy = r.legacy_identifier ? `'${r.legacy_identifier.replace(/'/g, "''")}'` : "NULL";
    const sql = `INSERT INTO equilibrium_expressions (id, expression_string, products, reactants, legacy_identifier)
VALUES (${r.id}, '${r.expression_string.replace(/'/g, "''")}', '${products}', '${reactants}', ${legacy})
ON CONFLICT DO NOTHING;`;
    await ds.query(sql);
  }
}

async function insertFootnotes(ds: DataSource, rows: FootnoteRow[]) {
  for (const r of rows) {
    const legacy = r.legacy_identifier ? `'${r.legacy_identifier.replace(/'/g, "''")}'` : "NULL";
    const notesLiteral = formatNotesToTextArrayLiteral(r.notes);
    const sql = `INSERT INTO footnotes (id, legacy_identifier, notes)
VALUES (${r.id}, ${legacy}, '${notesLiteral}')
ON CONFLICT DO NOTHING;`;
    await ds.query(sql);
  }
}

async function insertConditions(ds: DataSource, rows: ConditionRow[]) {
  for (const r of rows) {
    const sql = `INSERT INTO conditions (id, constant_kind, temperature, temperature_varies, ionic_strength)
VALUES (${r.id}, '${r.constant_kind}', ${r.temperature}, ${r.temperature_varies}, ${r.ionic_strength})
ON CONFLICT DO NOTHING;`;
    await ds.query(sql);
  }
}

async function insertConstants(ds: DataSource, rows: ConstantRow[]) {
  for (const r of rows) {
    const eq = typeof r.equilibrium_expression_id === "number" ? r.equilibrium_expression_id : "NULL";
    const cond = typeof r.conditions_id === "number" ? r.conditions_id : "NULL";
    const unc = typeof r.uncertainty_id === "number" ? r.uncertainty_id : "NULL";
    const foot = typeof r.footnote_id === "number" ? r.footnote_id : "NULL";
    const sql = `INSERT INTO constants (value, significant_figures, ligand_id, metal_id, equilibrium_expression_id, conditions_id, uncertainty_id, footnote_id)
VALUES (${r.value}, ${r.significant_figures}, ${r.ligand_id}, ${r.metal_id}, ${eq}, ${cond}, ${unc}, ${foot})
ON CONFLICT DO NOTHING;`;
    await ds.query(sql);
  }
}

async function main() {
  const fileArg = getArgValue("--file");
  if (!fileArg) {
    // eslint-disable-next-line no-console
    console.error("Usage: yarn import:chemlib --file /absolute/path/to/data.json");
    process.exit(1);
  }

  const absPath = path.isAbsolute(fileArg) ? fileArg : path.join(process.cwd(), fileArg);
  if (!fs.existsSync(absPath)) {
    // eslint-disable-next-line no-console
    console.error(`File not found: ${absPath}`);
    process.exit(1);
  }

  const raw = fs.readFileSync(absPath, "utf8");
  const data = JSON.parse(raw) as ChemlibDataset;

  await PostgresDataSource.initialize();
  const ds = PostgresDataSource;

  try {
    if (data.ligands?.length) await insertLigands(ds, data.ligands);
    if (data.metals?.length) await insertMetals(ds, data.metals);
    if (data.equilibrium_expressions?.length) await insertEquilibriumExpressions(ds, data.equilibrium_expressions);
    if (data.footnotes?.length) await insertFootnotes(ds, data.footnotes);
    if (data.conditions?.length) await insertConditions(ds, data.conditions);
    if (data.constants?.length) await insertConstants(ds, data.constants);
    // eslint-disable-next-line no-console
    console.log("Import complete.");
  } finally {
    if (ds.isInitialized) await ds.destroy();
  }
}

// eslint-disable-next-line @typescript-eslint/no-floating-promises
main();


