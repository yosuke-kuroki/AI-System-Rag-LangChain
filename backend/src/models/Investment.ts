import { Schema, model, Document } from "mongoose";

export interface IInvestmentInsight {
  date: string;
  title: string;
  url: string;
}

export interface IInvestment extends Document {
  company_name: string;
  location: string;
  website: string;
  sectors: string[];
  insights: IInvestmentInsight[];
}

const InvestmentInsightSchema = new Schema<IInvestmentInsight>({
  date: { type: String, required: true },
  title: { type: String, required: true },
  url: { type: String, required: true },
});

const InvestmentSchema = new Schema<IInvestment>({
  company_name: { type: String, required: true },
  location: { type: String, required: true },
  website: { type: String, required: true },
  sectors: { type: [String], default: [] },
  insights: { type: [InvestmentInsightSchema], default: [] },
});

export default model<IInvestment>("Investment", InvestmentSchema);
