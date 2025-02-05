import { Schema, model, Document } from "mongoose";

export interface ISector extends Document {
  sector: string;
  description: string;
  companies: string[];
  investment_team: string[];
}

const SectorSchema = new Schema<ISector>({
  sector: { type: String, required: true },
  description: { type: String, required: true },
  companies: { type: [String], default: [] },
  investment_team: { type: [String], default: [] },
});

export default model<ISector>("Sector", SectorSchema);
