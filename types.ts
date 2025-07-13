
export interface FinancialData {
  ticker: string | null;
  price: number | null;
  fcfPerShare: number | null;
  wacc: number | null; // as a decimal, e.g., 0.08
  currency: string | null;
}

export interface GroundingSource {
  uri: string;
  title: string;
}

export interface GeminiApiResponse {
  financialData: FinancialData;
  sources: GroundingSource[];
}
