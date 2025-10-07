import axios from "axios";
import { AdvanceSearchRequestModel } from "@/models/AdvanceSearchRequestModel";
import {
  LigandAdvanceSearchResultModel,
  LigandSearchResultModel,
  ProcessedLigandAdvanceSearchResultModel,
} from "@/models/LigandSearchResultModel";
import { ConstantResultModel } from "@/models/ConstantResultModel";
import { MolDataRawResultModel } from "@/models/MolDataResultModel";
import { ReferenceFetchResultModel } from "@/models/ReferenceFetchResultModel";

const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:8081/rest"
});

export async function getMolData(
  ligandId: number
): Promise<MolDataRawResultModel | null> {
  const result = await axiosClient.get<MolDataRawResultModel>(
    `/mol/get/${ligandId}`,
    {
      validateStatus: (status) =>
        (status >= 200 && status < 300) || status == 404,
    }
  );

  if (result.status !== 200) return null;

  return result.data;
}

export async function getReferences(
  ligandId: number
): Promise<ReferenceFetchResultModel[] | null> {
  const result = await axiosClient.get<ReferenceFetchResultModel[]>(
    `/ref/get/${ligandId}`,
    {
      validateStatus: (status) =>
        (status >= 200 && status < 300) || status == 404,
    }
  );

  if (result.status !== 200) return null;
  if (!result.data || result.data.length === 0) return null;

  return result.data;
}

export async function simpleSearch(
  ligands: string[]
): Promise<LigandSearchResultModel[] | null> {
  const result = await axiosClient.post<LigandSearchResultModel[]>(
    "/db/search/ligand",
    ligands
  );

  if (result.status !== 200) return null;

  return result.data;
}

export async function advanceSearch(
  reqModel: AdvanceSearchRequestModel
): Promise<ProcessedLigandAdvanceSearchResultModel[] | null> {
  const result = await axiosClient.post<LigandAdvanceSearchResultModel[]>(
    "/db/search/advance",
    reqModel
  );

  if (result.status !== 200) return null;

  return result.data.map((raw) =>
    ProcessedLigandAdvanceSearchResultModel.process(raw)
  );
}

export async function getConstants(
  ligandId: number,
  metalId: number
): Promise<ConstantResultModel[] | null> {
  const result = await axiosClient.post<ConstantResultModel[]>(
    "/db/constants",
    {
      ligandId: ligandId,
      metalId: metalId,
    }
  );

  if (result.status !== 200) return null;

  return result.data;
}

export { axiosClient };
