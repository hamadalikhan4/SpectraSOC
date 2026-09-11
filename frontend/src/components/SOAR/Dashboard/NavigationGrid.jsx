import {
  Activity,
  Bot,
  GitBranch,
  Library,
  Settings,
} from "lucide-react";

import { GlassCard } from "../../ui";

export default function NavigationGrid({ setSection }) {
  const modules = [
    {
      id: "playbooks",
      title: "Playbooks",
      text: "Create, version, and manage automation workflows.",
      icon: GitBranch,
    },
    {
      id: "executions",
      title: "Executions",
      text: "Track playbook runs, logs, failures, and outcomes.",
      icon: Activity,
    },
    {
      id: "actions",
      title: "Action Library",
      text: "Manage reusable actions and integrations.",
      icon: Library,
    },
    {
      id: "ai",
      title: "AI Builder",
      text: "Generate automation workflows using natural language.",
      icon: Bot,
    },
    {
      id: "settings",
      title: "Settings",
      text: "Configure approvals, retries, timeouts, and simulation mode.",
      icon: Settings,
    },
  ];

  return (
    <div className="soar-navigation-grid">
      {modules.map((module) => {
        const Icon = module.icon;

        return (
          <GlassCard className="soar-nav-card" key={module.title}>
            <button
              className="soar-nav-button"
              onClick={() => setSection(module.id)}
            >
              <div className="soar-nav-icon">
                <Icon size={24} />
              </div>

              <h3>{module.title}</h3>
              <p>{module.text}</p>
              <span>Open Module →</span>
            </button>
          </GlassCard>
        );
      })}
    </div>
  );
}