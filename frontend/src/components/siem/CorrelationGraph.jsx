import { useEffect, useState } from "react";
import API from "../../api/api";

import AttackTimeline from "./AttackTimeline";
import AIInvestigationPanel from "./AIInvestigationPanel";

import {
  Globe,
  Shield,
  Server,
  KeyRound,
  Terminal,
  Database,
  AlertTriangle,
  RefreshCcw,
} from "lucide-react";

export default function CorrelationGraph() {
  const [cases, setCases] = useState([]);
  const [selectedCase, setSelectedCase] = useState(null);

  const loadCases = async () => {
    try {
      const res = await API.get("/api/v1/correlation/cases");

      const data = res.data.cases || [];

      setCases(data);

      if (data.length > 0 && !selectedCase) {
        setSelectedCase(data[0]);
      }
    } catch (err) {
      console.error("Failed to load correlation cases", err);
    }
  };

  const runCorrelation = async () => {
    try {
      await API.post("/api/v1/correlation/run");
      await loadCases();
    } catch (err) {
      console.error(err);
      alert("Correlation failed.");
    }
  };

  useEffect(() => {
    loadCases();
  }, []);

  const buildNodes = () => {
    if (!selectedCase) return [];

    const chain = selectedCase.attack_chain || [];

    const nodes = [
      {
        title: "Internet",
        subtitle: selectedCase.source_ip || "Unknown",
        icon: Globe,
        type: "source",
      },
      {
        title: "SIEM Detection",
        subtitle: "Correlation Engine",
        icon: Shield,
        type: "control",
      },
    ];

    chain.forEach((event) => {
      nodes.push({
        title: event.event_type?.replaceAll("_", " "),
        subtitle: `${event.mitre_technique || "N/A"} • Risk ${
          event.risk_score
        }`,
        icon: getIcon(event.event_type),
        type: event.risk_score >= 80 ? "critical" : "event",
      });
    });

    return nodes;
  };

  const getIcon = (type = "") => {
    type = type.toLowerCase();

    if (type.includes("login")) return KeyRound;

    if (type.includes("command")) return Terminal;

    if (type.includes("power")) return Terminal;

    if (type.includes("sql")) return Database;

    return Server;
  };

  const nodes = buildNodes();

  return (
    <div className="siem-card correlation-card">
      <div className="siem-card-head">
        <div>
          <h3>Correlation Engine</h3>

          <p className="subtitle">
            AI powered attack correlation and investigation workspace.
          </p>
        </div>

        <button onClick={runCorrelation}>
          <RefreshCcw size={15} />
          Run Correlation
        </button>
      </div>

      <div className="correlation-layout">
        {/* ================= LEFT ================= */}

        <div className="correlation-cases">
          <h4>Correlation Cases</h4>

          {cases.length === 0 && (
            <div className="result">
              No correlation cases found.
            </div>
          )}

          {cases.map((c) => (
            <button
              key={c.case_id}
              className={
                selectedCase?.case_id === c.case_id
                  ? "case-item active"
                  : "case-item"
              }
              onClick={() => setSelectedCase(c)}
            >
              <div>
                <strong>{c.source_ip}</strong>

                <p>{c.title}</p>
              </div>

              <span className={`pill ${c.severity}`}>
                {c.severity}
              </span>
            </button>
          ))}
        </div>

        {/* ================= RIGHT ================= */}

        <div className="attack-chain-panel">
          {!selectedCase && (
            <div className="result">
              Select a correlation case.
            </div>
          )}

          {selectedCase && (
            <>
              <div className="case-summary">
                <div>
                  <h4>{selectedCase.title}</h4>

                  <p>{selectedCase.ai_summary}</p>
                </div>

                <div className="case-score">
                  <span>Risk</span>

                  <strong>{selectedCase.risk_score}</strong>
                </div>
              </div>

              {/* ================= Investigation Workspace ================= */}

              <div className="investigation-workspace">
                <AttackTimeline
                  selectedCase={selectedCase}
                />

                <AIInvestigationPanel
                  selectedCase={selectedCase}
                />
              </div>

              {/* ================= Attack Flow ================= */}

              <div className="attack-chain">

                {nodes.map((node, index) => {

                  const Icon = node.icon;

                  return (
                    <div
                      className="chain-step"
                      key={index}
                    >
                      <div
                        className={`chain-node ${node.type}`}
                      >
                        <Icon size={22} />

                        <div>
                          <strong>{node.title}</strong>

                          <p>{node.subtitle}</p>
                        </div>
                      </div>

                      {index !== nodes.length - 1 && (
                        <div className="chain-line">
                          <span></span>
                        </div>
                      )}
                    </div>
                  );
                })}

              </div>

              {/* ================= MITRE ================= */}

              <div className="mitre-strip">
                {(selectedCase.mitre_tactics || []).map((tactic) => (
                  <span key={tactic}>
                    {tactic}
                  </span>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}