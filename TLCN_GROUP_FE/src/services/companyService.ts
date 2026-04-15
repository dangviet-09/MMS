import { apiClient } from "./apiClient";
import { CompanyProfile, UpdateCompanyProfilePayload } from "../types/types";

export const getCompanyProfile = async (): Promise<CompanyProfile> => {
  const response = await apiClient.get<any>('/companies/profile');
  if (response.company) {
    return {
      companyId: response.company.id,
      companyName: response.company.companyName,
      email: response.email,
      taxCode: response.company.taxCode,
      website: response.company.website,
      address: response.address,
      industry: response.company.industry,
      description: response.company.description,
      createdAt: response.company.createdAt,
      updatedAt: response.company.updatedAt,
    };
  }
  return response as CompanyProfile;
};

export const updateCompanyProfile = async (payload: UpdateCompanyProfilePayload): Promise<CompanyProfile> => {
  const response = await apiClient.put<any>('/companies/profile', payload);
  if (response.company) {
    return {
      companyId: response.company.id,
      companyName: response.company.companyName,
      email: response.email,
      taxCode: response.company.taxCode,
      website: response.company.website,
      address: response.address,
      industry: response.company.industry,
      description: response.company.description,
      createdAt: response.company.createdAt,
      updatedAt: response.company.updatedAt,
    };
  }
  return response as CompanyProfile;
};
