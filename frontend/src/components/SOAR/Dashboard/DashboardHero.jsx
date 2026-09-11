import { Plus, ShieldCheck, Sparkles } from "lucide-react";
import { PageHeader } from "../../ui";

export default function DashboardHero() {
  return (
    <PageHeader
      eyebrow="SOAR Command Center"
      title="Security Orchestration, Automation & Response"
      description="Coordinate playbooks, simulations, execution workflows, approvals, and AI-assisted response automation from one enterprise command center."
      action={
        <>
          <button className="btn secondary">
            <Sparkles size={15} />
            AI Builder
          </button>

          <button className="btn">
            <Plus size={15} />
            Create Playbook
          </button>
        </>
      }
    />
  );
}