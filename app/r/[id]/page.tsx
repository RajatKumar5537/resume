import { ResumeView } from "@/components/ResumeView";

export default async function ResumePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <ResumeView id={id} />;
}
