import { useState } from "react";
import {
  Bot,
  CheckCircle2,
  Cpu,
  GitBranch,
  ShieldCheck,
  Sparkles,
  TriangleAlert,
} from "lucide-react";

import SOAR_API from "../../../api/soarApi";

import AIBuilderHero from "./AIBuilderHero";
import PromptComposer from "./PromptComposer";
import GeneratedPlaybookPreview from "./GeneratedPlaybookPreview";
import AIWorkflowSteps from "./AIWorkflowSteps";

const defaultPrompt =
  "Create a phishing investigation playbook that extracts IOCs, enriches them with VirusTotal and AbuseIPDB, calculates risk score, creates an incident, maps MITRE ATT&CK, and notifies the SOC analyst.";

function detectPlaybookType(prompt) {
  const lower = prompt.toLowerCase();

  if (
    lower.includes("malware") ||
    lower.includes("endpoint") ||
    lower.includes("edr") ||
    lower.includes("hash") ||
    lower.includes("isolate")
  ) {
    return "malware";
  }

  if (
    lower.includes("brute") ||
    lower.includes("login") ||
    lower.includes("credential") ||
    lower.includes("failed login") ||
    lower.includes("account lock")
  ) {
    return "bruteforce";
  }

  if (
    lower.includes("phishing") ||
    lower.includes("email") ||
    lower.includes("mailbox") ||
    lower.includes("sender") ||
    lower.includes("url")
  ) {
    return "phishing";
  }

  return "generic";
}

function buildPlaybookFromPrompt(prompt) {
  const type = detectPlaybookType(prompt);

  const profiles = {
    phishing: {
      name: "AI Generated Phishing Triage",
      category: "Email Security",
      severity: "High",
      triggerSource: "Suspicious Email Alert",
      mitre: [
        { technique: "T1566", name: "Phishing" },
        { technique: "T1204", name: "User Execution" },
        { technique: "T1059", name: "Command and Scripting Interpreter" },
      ],
      connectors: [
        "Email Gateway",
        "VirusTotal",
        "AbuseIPDB",
        "MITRE Engine",
        "Incident Repository",
        "Notification Service",
      ],
      summary:
        "SpectraAI generated a phishing investigation workflow with IOC extraction, enrichment, MITRE mapping, incident creation, and analyst notification.",
      triggerAction: "email.alert.trigger",
      triggerConnector: "Email Gateway",
    },

    malware: {
      name: "AI Generated Malware Containment",
      category: "Endpoint Security",
      severity: "Critical",
      triggerSource: "EDR Malware Alert",
      mitre: [
        { technique: "T1059", name: "Command and Scripting Interpreter" },
        { technique: "T1105", name: "Ingress Tool Transfer" },
        { technique: "T1204", name: "User Execution" },
      ],
      connectors: [
        "Microsoft Defender",
        "VirusTotal",
        "EDR Connector",
        "MITRE Engine",
        "Incident Repository",
        "Notification Service",
      ],
      summary:
        "SpectraAI generated a malware containment workflow with hash enrichment, endpoint risk evaluation, containment recommendation, incident creation, and analyst notification.",
      triggerAction: "edr.malware.trigger",
      triggerConnector: "Microsoft Defender",
    },

    bruteforce: {
      name: "AI Generated Brute Force Response",
      category: "Identity Protection",
      severity: "Medium",
      triggerSource: "Failed Login Spike",
      mitre: [
        { technique: "T1110", name: "Brute Force" },
        { technique: "T1078", name: "Valid Accounts" },
      ],
      connectors: [
        "SIEM",
        "Identity Provider",
        "AbuseIPDB",
        "MITRE Engine",
        "Incident Repository",
        "Notification Service",
      ],
      summary:
        "SpectraAI generated a brute force response workflow with failed-login analysis, IP enrichment, MITRE mapping, incident creation, and account protection recommendation.",
      triggerAction: "identity.failed_login.trigger",
      triggerConnector: "SIEM",
    },

    generic: {
      name: "AI Generated Security Automation",
      category: "Security Automation",
      severity: "Medium",
      triggerSource: "Security Alert",
      mitre: [{ technique: "T1059", name: "Command and Scripting Interpreter" }],
      connectors: [
        "SIEM",
        "VirusTotal",
        "MITRE Engine",
        "Incident Repository",
        "Notification Service",
      ],
      summary:
        "SpectraAI generated a generic security automation workflow based on the analyst prompt.",
      triggerAction: "security.alert.trigger",
      triggerConnector: "SpectraSOC SIEM",
    },
  };

  const profile = profiles[type];
  const riskThreshold = profile.severity === "Critical" ? 80 : 70;

  return {
    type,

    playbook: {
      name: profile.name,
      description: `AI-generated SOAR workflow based on this analyst prompt: ${prompt}`,
      category: profile.category,
      status: "Draft",
      version: "v1.0",
      trigger_type: "AI Generated Trigger",
      trigger_source: profile.triggerSource,
      severity: profile.severity,
      is_active: true,
      created_by: "SpectraAI",
      steps: [
        {
          step_order: 1,
          step_type: "Trigger",
          name: profile.triggerSource,
          description: "Starts when the configured security event is detected.",
          action_key: profile.triggerAction,
          connector_name: profile.triggerConnector,
          config: {},
          condition: {},
          timeout_seconds: 60,
          retry_count: 0,
        },
        {
          step_order: 2,
          step_type: "Action",
          name: "Extract Indicators",
          description:
            "Extract IPs, URLs, domains, hashes, users, and related security artifacts.",
          action_key: "ioc.extract",
          connector_name: "SpectraSOC Parser",
          config: {
            extract_ips: true,
            extract_urls: true,
            extract_domains: true,
            extract_hashes: true,
            extract_users: true,
          },
          condition: {},
          timeout_seconds: 60,
          retry_count: 1,
        },
        {
          step_order: 3,
          step_type: "Action",
          name: "Threat Intelligence Enrichment",
          description:
            "Enrich extracted indicators using configured threat intelligence providers.",
          action_key: "ioc.enrich",
          connector_name: "VirusTotal",
          config: {
            providers: ["VirusTotal", "AbuseIPDB"],
          },
          condition: {},
          timeout_seconds: 90,
          retry_count: 2,
        },
        {
          step_order: 4,
          step_type: "Action",
          name: "MITRE ATT&CK Mapping",
          description: "Map observed behavior to MITRE ATT&CK techniques.",
          action_key: "mitre.map",
          connector_name: "SpectraSOC MITRE Engine",
          config: {
            techniques: profile.mitre.map((item) => item.technique),
          },
          condition: {},
          timeout_seconds: 45,
          retry_count: 1,
        },
        {
          step_order: 5,
          step_type: "Decision",
          name: "Risk Score Evaluation",
          description:
            "Evaluate calculated risk score and escalate if threshold is exceeded.",
          action_key: "risk.evaluate",
          connector_name: "SpectraSOC Risk Engine",
          config: {
            threshold: riskThreshold,
          },
          condition: {
            risk_score: `>${riskThreshold}`,
          },
          timeout_seconds: 30,
          retry_count: 0,
        },
        {
          step_order: 6,
          step_type: "Action",
          name: "Create Incident",
          description:
            "Create incident, attach evidence, and persist investigation timeline.",
          action_key: "incident.create",
          connector_name: "Incident Repository",
          config: {
            severity: profile.severity,
            attach_evidence: true,
            create_timeline: true,
          },
          condition: {
            risk_score: `>${riskThreshold}`,
          },
          timeout_seconds: 60,
          retry_count: 1,
        },
        {
          step_order: 7,
          step_type: "Action",
          name: "Notify SOC Analyst",
          description:
            "Notify SOC analyst with AI-generated summary and recommended actions.",
          action_key: "notify.analyst",
          connector_name: "Notification Service",
          config: {
            channel: "SOC Console",
            include_ai_summary: true,
          },
          condition: {},
          timeout_seconds: 30,
          retry_count: 1,
        },
      ],
    },

    mitre: profile.mitre,
    connectors: profile.connectors,
    summary: profile.summary,

    validation: [
      {
        title: "Safe Automation Boundary",
        status: "Passed",
        detail:
          "The generated workflow does not perform destructive actions without analyst review.",
      },
      {
        title: "Connector Readiness",
        status: type === "malware" || type === "bruteforce" ? "Warning" : "Passed",
        detail:
          type === "malware"
            ? "Microsoft Defender or EDR connector should be configured before endpoint containment."
            : type === "bruteforce"
            ? "Identity provider connector should be configured before account lockout automation."
            : "Required enrichment and notification connectors are compatible with the current SOAR design.",
      },
      {
        title: "Audit Logging",
        status: "Passed",
        detail:
          "All generated workflow actions can be persisted to execution logs, timeline, and evidence records.",
      },
    ],
  };
}

export default function AIBuilder({ setSection }) {
  const [prompt, setPrompt] = useState(defaultPrompt);
  const [generated, setGenerated] = useState(buildPlaybookFromPrompt(defaultPrompt));
  const [creating, setCreating] = useState(false);
  const [createdPlaybook, setCreatedPlaybook] = useState(null);
  const [error, setError] = useState("");

  const generatePlaybook = () => {
    setError("");
    setCreatedPlaybook(null);

    const nextGenerated = buildPlaybookFromPrompt(prompt);
    setGenerated(nextGenerated);
  };

  const createBackendPlaybook = async () => {
    if (createdPlaybook) return;

    try {
      setCreating(true);
      setError("");

      const created = await SOAR_API.createPlaybook(generated.playbook);
      setCreatedPlaybook(created);
    } catch (err) {
      console.error(err);
      setError("Failed to create AI-generated playbook. Check backend logs.");
    } finally {
      setCreating(false);
    }
  };

  const openPlaybooks = () => {
    if (setSection) {
      setSection("playbooks");
    }
  };

  return (
    <div className="ai-builder">
      <AIBuilderHero />

      {error && (
        <div
          className="spectra-glass-card"
          style={{ padding: "16px", color: "#ff5c7a" }}
        >
          {error}
        </div>
      )}

      {createdPlaybook && (
        <div
          className="spectra-glass-card"
          style={{
            padding: "16px",
            color: "#00ffaa",
            display: "flex",
            justifyContent: "space-between",
            gap: "14px",
            alignItems: "center",
          }}
        >
          <span>
            Playbook created successfully in backend: <b>{createdPlaybook.name}</b>
          </span>

          <button className="secondary-btn" onClick={openPlaybooks}>
            Open in Playbooks
          </button>
        </div>
      )}

      <div className="ai-builder-layout">
        <main className="ai-builder-main">
          <PromptComposer
            prompt={prompt}
            setPrompt={setPrompt}
            onGenerate={generatePlaybook}
          />

          <GeneratedPlaybookPreview
            generated={generated}
            creating={creating}
            createdPlaybook={createdPlaybook}
            onCreate={createBackendPlaybook}
            onOpenPlaybooks={openPlaybooks}
          />

          <AIWorkflowSteps steps={generated.playbook.steps} />
        </main>

        <aside className="ai-builder-side">
          <DynamicValidationPanel generated={generated} />
        </aside>
      </div>
    </div>
  );
}

function DynamicValidationPanel({ generated }) {
  return (
    <div className="ai-validation-stack">
      <div className="spectra-glass-card ai-validation-panel">
        <div className="panel-title">
          <ShieldCheck size={18} />
          AI Safety Validation
        </div>

        <p className="ai-subtitle">
          SpectraAI checks automation safety, connector availability, and
          enterprise readiness before playbook creation.
        </p>

        <div className="validation-list">
          {generated.validation.map((item) => (
            <div className="validation-item" key={item.title}>
              <div
                className={`validation-icon ${
                  item.status === "Warning" ? "warning" : "passed"
                }`}
              >
                {item.status === "Warning" ? (
                  <TriangleAlert size={16} />
                ) : (
                  <CheckCircle2 size={16} />
                )}
              </div>

              <div>
                <h4>{item.title}</h4>
                <span>{item.status}</span>
                <p>{item.detail}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="spectra-glass-card ai-mitre-panel">
        <div className="panel-title">
          <GitBranch size={18} />
          MITRE ATT&CK Mapping
        </div>

        <div className="mitre-list">
          {generated.mitre.map((item) => (
            <div className="mitre-item" key={item.technique}>
              <b>{item.technique}</b>
              <span>{item.name}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="spectra-glass-card ai-connectors-panel">
        <div className="panel-title">
          <Cpu size={18} />
          Required Connectors
        </div>

        <div className="required-connector-list">
          {generated.connectors.map((item) => (
            <div className="required-connector" key={item}>
              <span />
              {item}
            </div>
          ))}
        </div>
      </div>

      <div className="spectra-glass-card ai-builder-copilot">
        <div className="panel-title">
          <Bot size={18} />
          SpectraAI Copilot
        </div>

        <div className="copilot-message">
          <Sparkles size={17} />
          <p>{generated.summary}</p>
        </div>

        <button className="secondary-btn full-width-btn">
          Ask Follow-up
        </button>
      </div>
    </div>
  );
}