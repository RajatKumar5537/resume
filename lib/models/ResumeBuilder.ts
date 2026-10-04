import { Schema, model, models } from "mongoose";

const ResumeBuilderSchema = new Schema(
  {
    kind: { type: String, required: true, enum: ["profile", "resume"] },
    recordId: { type: String, required: true },
    updatedAt: { type: String, default: "" },
    payload: { type: Schema.Types.Mixed, required: true },
  },
  { collection: "resume_builder" },
);

ResumeBuilderSchema.index({ kind: 1, recordId: 1 }, { unique: true });

const ResumeBuilder = models.ResumeBuilder || model("ResumeBuilder", ResumeBuilderSchema);

export default ResumeBuilder;
