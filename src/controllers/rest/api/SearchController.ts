import { Controller, Inject, Injectable } from "@tsed/di";
import { array, Description, Example, Post, Returns, Schema, Summary } from "@tsed/schema";
import { POSTGRES_DATA_SOURCE } from "../../../datasources/PostgresDatasource";
import { DataSource } from "typeorm";
import { BodyParams } from "@tsed/platform-params";
import { Constant } from "../../../datasources/entities/Constant";
import { BadRequest } from "@tsed/exceptions";
import {
  LigandAdvanceSearchRawResult,
  LigandAdvanceSearchResultModel,
  LigandAdvanceSearchResultSchema,
  LigandSearchResultModel,
  LigandSearchResultSchema
} from "../../../models/LigandSearchResultModel";
import {
  AdvanceSearchRequestExample,
  AdvanceSearchRequestModel,
  AdvanceSearchRequestSchema
} from "../../../models/AdvanceSearchRequestModel";
import ArrayUtils from "../../../utils/ArrayUtils";
import { ConstantRequestExample, ConstantRequestModel, ConstantRequestSchema } from "../../../models/ConstantRequestModel";
import { ConstantResultModel, ConstantResultModelSchema, ConstantResultRawModel } from "../../../models/ConstantResultModel";

@Injectable()
@Controller("/db")
export class SearchController {
  @Inject(POSTGRES_DATA_SOURCE)
  protected dataSource: DataSource | null;

  $onInit() {
    if (this.dataSource && this.dataSource.isInitialized) {
      console.log("POSTGREDB DATASOURCE INIT");
    } else {
      console.log("⚠️ Database not available - running in offline mode");
    }
  }

  @Post("/search/ligand")
  @Returns(400).Description("POST Body is empty")
  @Returns(200, [LigandSearchResultModel]).Description("Ligand search result").Schema(array().items(LigandSearchResultSchema))
  @Summary("Perform a search using ligand")
  @Description("Perform a search using ligand, returns an array of search result. Can have multiple ligand keywords at same time.")
  async searchByLigand(@BodyParams() @Example(["EDTA"]) ligands: string[]): Promise<LigandSearchResultModel[]> {
    if (ligands.length === 0) throw new BadRequest("POST Body is empty");

    if (!this.dataSource) {
      throw new BadRequest("Database not available - service is in offline mode");
    }

    const ligandsStr = ligands.filter(l => l && l.trim()).join("%");
    if (!ligandsStr) throw new BadRequest("No valid ligand names provided");

    return await this.dataSource
      .getRepository(Constant)
      .createQueryBuilder("constants")
      .distinct(true)
      .select(["metals.central_element", "constants.ligand_id", "constants.metal_id"])
      .addSelect("ligands.name", "name")
      .addSelect("ligands.charge", "ligand_charge")
      .addSelect("COALESCE(ligands.form::text, '')", "form")
      .addSelect("metals.charge", "metal_charge")
      .addSelect("COALESCE(metals.formula_string, '')", "formula_string")
      .innerJoin("ligands", "ligands", "constants.ligand_id = ligands.id")
      .innerJoin("metals", "metals", "constants.metal_id = metals.id")
      .where(`ligands.name iLike '%${ligandsStr}%'`)
      .getRawMany<LigandSearchResultModel>();
  }

  @Post("/search/advance")
  @Returns(400).Description("Empty Post Body!")
  @Returns(200, [LigandAdvanceSearchResultModel])
    .Description("Advance search result")
    .Schema(array().items(LigandAdvanceSearchResultSchema))
  @Summary("Perform a advance search using multiple fields")
  @Description("Perform a advance search using multiple fields, returns an array of search result.")
  async advanceSearch(
    @BodyParams()
    @Schema(AdvanceSearchRequestSchema)
    @Example(AdvanceSearchRequestExample)
    searchReq: AdvanceSearchRequestModel
  ): Promise<LigandAdvanceSearchResultModel[]> {
    if (!searchReq) throw new BadRequest("Empty Post Body!");

    if (!this.dataSource) {
      throw new BadRequest("Database not available - service is in offline mode");
    }

    const hasLigandsFilter = ArrayUtils.any(searchReq.ligands);
    const ligandsArray = Array.isArray(searchReq.ligands) ? searchReq.ligands.filter(l => l && l.trim() !== '') : [];
    const whereQuery = hasLigandsFilter && ligandsArray.length > 0 ? `ligands.name iLike '%${ligandsArray.join("%")}%'` : '';
    const limit = searchReq.limit ?? 300;

    let query = this.dataSource
      .getRepository(Constant)
      .createQueryBuilder("constants")
      .distinct(true)
      .select(["ligands.name", "ligands.molecular_formula", "ligands.categories", "metals.central_element", "constants.ligand_id", "constants.metal_id"])
      .addSelect("ligands.charge", "ligand_charge")
      .addSelect("COALESCE(ligands.form::text, '')", "form")
      .addSelect("metals.charge", "metal_charge")
      .addSelect("COALESCE(metals.formula_string, '')", "formula_string")
      .innerJoin("ligands", "ligands", "constants.ligand_id = ligands.id")
      .innerJoin("metals", "metals", "constants.metal_id = metals.id")
      .limit(limit);

    if (hasLigandsFilter && whereQuery) query = query.where(whereQuery);

    if (ArrayUtils.any(searchReq.metals)) {
      const metalStr = searchReq.metals?.map((m) => `'${m}'`).join(",");

      if (hasLigandsFilter) query = query.andWhere(`metals.central_element IN (${metalStr})`);
      else query = query.where(`metals.central_element IN (${metalStr})`);
    }

    if (ArrayUtils.any(searchReq.ligandCharges)) {
      // eslint-disable-next-line
      const ligandChargesStr = searchReq.ligandCharges!.join(",");
      query = query.andWhere(`ligands.charge IN (${ligandChargesStr})`);
    }

    if (ArrayUtils.any(searchReq.metalCharges)) {
      // eslint-disable-next-line
      const metalChargesStr = searchReq.metalCharges!.join(",");
      query = query.andWhere(`metals.charge IN (${metalChargesStr})`);
    }

    if (ArrayUtils.any(searchReq.categories)) {
      // eslint-disable-next-line
      const categoryStr = searchReq.categories!.map((m) => `'${m}'`).join(",");
      query = query.andWhere(`ligands.categories @> ARRAY[${categoryStr}]`);
    }

    if (ArrayUtils.any(searchReq.chemicals)) {
      // eslint-disable-next-line
      const chemicalStr = searchReq.chemicals!.join(",");
      query = query.andWhere(`(ligands.molecular_formula).atom_counts @> ARRAY[${chemicalStr}]::molecularformulaentry[]`);
    }

    const rawResult = await query.getRawMany<LigandAdvanceSearchRawResult>();
    const result: LigandAdvanceSearchResultModel[] = [];

    rawResult.forEach((r) => {
      result.push(LigandAdvanceSearchResultModel.fromRaw(r));
    });

    return result;
  }

  @Post("/constants")
  @Returns(200, [ConstantResultModel]).Description("Constants result").Schema(array().items(ConstantResultModelSchema))
  @Summary("Get details based on ids of metal and ligand")
  @Description("Get details based on ids of metal and ligand, returns an array of results.")
  async getConstants(
    @BodyParams()
    @Schema(ConstantRequestSchema)
    @Example(ConstantRequestExample)
    constReq: ConstantRequestModel
  ): Promise<ConstantResultModel[]> {
    if (!this.dataSource) {
      throw new BadRequest("Database not available - service is in offline mode");
    }

    const withQuery = this.dataSource
      .getRepository(Constant)
      .createQueryBuilder("constants")
      .select([
        "constants.value",
        "constants.significant_figures",
        "constants.equilibrium_expression_id",
        "constants.conditions_id",
        "constants.uncertainty_id",
        "constants.footnote_id",
        "constants.ligand_id",
        "constants.metal_id"
      ])
      .where("constants.ligand_id = :ligandId", { ligandId: constReq.ligandId })
      .andWhere("constants.metal_id = :metalId", { metalId: constReq.metalId });

    const resultRaw = await this.dataSource!
      .createQueryBuilder()
      .addCommonTableExpression(withQuery, "table_ids")
      .distinct(true)
      .select([
        "ligands.name",
        "ligands.molecular_formula",
        "table_ids.value",
        "table_ids.significant_figures",
        "ligands.categories",
        "metals.central_element",
        "conditions.constant_kind",
        "conditions.temperature",
        "conditions.temperature_varies",
        "conditions.ionic_strength",
        "equilibrium_expressions.expression_string",
        "equilibrium_expressions.products",
        "equilibrium_expressions.reactants",
        "equilibrium_expressions.notes",
        "equilibrium_expressions.direction",
        "equilibrium_expressions.magnitude"
      ])
      .addSelect("footnotes.legacy_identifier", "legacy_identifier")
      .addSelect("ligands.charge", "ligand_charge")
      .addSelect("(ligands.form).protonation", "protonation")
      .addSelect("metals.charge", "metal_charge")
      .from("table_ids", "table_ids")
      .leftJoin("ligands", "ligands", "ligands.id = table_ids.ligand_id")
      .leftJoin("metals", "metals", "metals.id = table_ids.metal_id")
      .leftJoin("equilibrium_expressions", "equilibrium_expressions", "equilibrium_expressions.id = table_ids.equilibrium_expression_id")
      .leftJoin("uncertainties", "uncertainties", "uncertainties.id = table_ids.uncertainty_id")
      .leftJoin("footnotes", "footnotes", "footnotes.id = table_ids.footnote_id")
      .leftJoin("conditions", "conditions", "conditions.id = table_ids.conditions_id")
      .getRawMany<ConstantResultRawModel>();

    const result: ConstantResultModel[] = [];

    resultRaw.forEach((r) => {
      result.push(ConstantResultModel.fromRaw(r));
    });

    return result;
  }
}
