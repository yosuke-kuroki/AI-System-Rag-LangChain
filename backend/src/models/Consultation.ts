import { Schema, model, Document } from "mongoose";

export interface IConsultation extends Document {
  date: string;
  company_name: string;
  consultation_details: string;
  hours: number;
}

const ConsultationSchema = new Schema<IConsultation>({
  date: { type: String, required: true },
  company_name: { type: String, required: true },
  consultation_details: { type: String, required: true },
  hours: { type: Number, required: true },
});

export default model<IConsultation>("Consultation", ConsultationSchema);
