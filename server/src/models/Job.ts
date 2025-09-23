import { Schema, model, Document, Types } from "mongoose";

export interface IJob extends Document {
  user: Types.ObjectId;
  company: string;
  position: string;
  status: "Applied" | "Interview" | "Offer" | "Rejected";
  date: Date;
  tags: string[];
}

const jobSchema = new Schema<IJob>({
  user: { type: Schema.Types.ObjectId, ref: "User", required: true },
  company: { type: String, required: true },
  position: { type: String, required: true },
  status: {
    type: String,
    enum: ["Applied", "Interview", "Offer", "Rejected"],
    default: "Applied",
  },
  date: { type: Date, default: Date.now },
  tags: { type: [String], default: [] },
});

export default model<IJob>("Job", jobSchema);
