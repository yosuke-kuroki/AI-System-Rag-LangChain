import { Schema, model, Document } from "mongoose";

export interface IInsight {
  title: string;
  date: string;
  link: string;
}

export interface ITeamMember extends Document {
  name: string;
  role: string;
  bio: string;
  personal_quote: string;
  related_insights: IInsight[];
}

const InsightSchema = new Schema<IInsight>({
  title: { type: String, required: true },
  date: { type: String, required: true },
  link: { type: String, required: true },
});

const TeamMemberSchema = new Schema<ITeamMember>({
  name: { type: String, required: true },
  role: { type: String, required: true },
  bio: { type: String, required: true },
  personal_quote: { type: String, required: true },
  related_insights: { type: [InsightSchema], default: [] },
});

export default model<ITeamMember>("TeamMember", TeamMemberSchema);
