import { Schema, model, models } from "mongoose";

const ResumeBuilderSchema = new Schema(
  {
    kind: { type: String, required: true, enum: ["profile", "resume", "account"] },
    recordId: { type: String, required: true },
    userId: { type: String, default: "" },
    email: { type: String },
    name: { type: String },
    passwordHash: { type: String },
    updatedAt: { type: String },
    payload: { type: Schema.Types.Mixed, required: true },
  },
  { collection: "resume_builder" },
);

ResumeBuilderSchema.index({ kind: 1, recordId: 1 }, { unique: true });
ResumeBuilderSchema.index({ kind: 1, userId: 1 });

if (models.ResumeBuilder && !models.ResumeBuilder.schema.path("email")) {
  delete models.ResumeBuilder;
}

const ResumeBuilder = models.ResumeBuilder || model("ResumeBuilder", ResumeBuilderSchema);

export default ResumeBuilder;
