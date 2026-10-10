import { ConceptExplorer } from "@/components/ConceptExplorer";
import { Suspense } from "react";

export default function ConceptsPage() {
  return (
    <Suspense fallback={<p className="hint">Opening interview preparation…</p>}>
      <ConceptExplorer />
    </Suspense>
  );
}
