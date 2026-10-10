import { Suspense } from "react";
import { InterviewDesk } from "@/components/InterviewDesk";

export default function InterviewPage() {
  return (
    <Suspense>
      <InterviewDesk />
    </Suspense>
  );
}
