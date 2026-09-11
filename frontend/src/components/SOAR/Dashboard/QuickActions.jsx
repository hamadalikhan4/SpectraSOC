import {
  Bot,
  Library,
  PlayCircle,
  Plus,
  TestTube2,
  Workflow,
} from "lucide-react";

import { GlassCard } from "../../ui";

export default function QuickActions({ setSection }) {
  const actions = [
    { label: "Create Playbook", icon: Plus, target: "playbooks" },
    { label: "Run Simulation", icon: TestTube2, target: "executions" },
    { label: "Action Library", icon: Library, target: "actions" },
    { label: "AI Builder", icon: Bot, target: "ai" },
    { label: "View Executions", icon: PlayCircle, target: "executions" },
    { label: "Workflow Designer", icon: Workflow, target: "playbooks" },
  ];

  return (
    <GlassCard className="soar-panel">
      <div className="soar-panel-head">
        <div>
          <h3>Quick Actions</h3>
          <p>Common automation tasks and analyst workflows.</p>
        </div>
      </div>

      <div className="soar-quick-grid">
        {actions.map((item) => {
          const Icon = item.icon;

          return (
            <button
              className="soar-quick-action"
              key={item.label}
              onClick={() => setSection(item.target)}
            >
              <Icon size={18} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>
    </GlassCard>
  );
}