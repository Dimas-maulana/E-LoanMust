// Plafond / Product model
export interface Plafond {
  id: number;
  name: string;
  code: string;
  description?: string;
  minAmount: number;
  maxAmount: number;
  minTenor: number;
  maxTenor: number;
  interestRate: number;
  adminFee?: number;
  active: boolean;
  createdAt?: string;
  updatedAt?: string;
}

// Plafond tier icons
export type PlafondTier = 'SILVER' | 'GOLD' | 'PLATINUM';

// Create/Update Plafond request
export interface PlafondRequest {
  name: string;
  code: string;
  description?: string;
  minAmount: number;
  maxAmount: number;
  minTenor: number;
  maxTenor: number;
  interestRate: number;
  adminFee?: number;
  active: boolean;
}
