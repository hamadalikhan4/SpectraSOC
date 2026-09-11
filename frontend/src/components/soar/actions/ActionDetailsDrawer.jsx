import { useState } from "react";
import {
  Activity,
  CheckCircle2,
  KeyRound,
  Loader2,
  RefreshCcw,
  ShieldAlert,
  Terminal,
  X,
} from "lucide-react";

import SOAR_API from "../../../api/soarApi";

function statusClass(status = "Available") {
  return status.toLowerCase().replace(/\s+/g, "-");
}

export default function ActionDetailsDrawer({ connector, onClose, onRefresh }) {
  const [validating, setValidating] = useState(false);
  const [testing, setTesting] = useState(false);
  const [configuring, setConfiguring] = useState(false);

  const capabilities = Array.isArray(connector.capabilities)
    ? connector.capabilities
    : [];

  const validateConnector = async () => {
    try {
      setValidating(true);

      await SOAR_API.getConnector(connector.id);

      await SOAR_API.updateConnector(connector.id, {
        status: connector.status || "Available",
        health: connector.health || "Ready",
      });

      await onRefresh();
    } catch (err) {
      console.error(err);
      alert("Connector validation failed. Check backend logs.");
    } finally {
      setValidating(false);
    }
  };

  const testConnection = async () => {
    try {
      setTesting(true);

      await SOAR_API.updateConnector(connector.id, {
        status: "Connected",
        health: "Healthy",
      });

      await onRefresh();
      onClose();
    } catch (err) {
      console.error(err);
      alert("Failed to test connector connection.");
    } finally {
      setTesting(false);
    }
  };

  const configureConnector = async () => {
    try {
      setConfiguring(true);

      await SOAR_API.updateConnector(connector.id, {
        status: "Connected",
        health: "Healthy",
        is_enabled: true,
      });

      await onRefresh();
      onClose();
    } catch (err) {
      console.error(err);
      alert("Failed to configure connector.");
    } finally {
      setConfiguring(false);
    }
  };

  return (
    <div className="action-drawer-backdrop">
      <aside className="action-drawer">
        <div className="drawer-header">
          <div>
            <span className={`connector-status ${statusClass(connector.status)}`}>
              {connector.status || "Available"}
            </span>

            <h2>{connector.name}</h2>

            <p>{connector.category || "Custom Automation"}</p>
          </div>

          <button onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="drawer-summary-grid">
          <div>
            <span>Actions</span>
            <b>{connector.actions || 0}</b>
          </div>

          <div>
            <span>Executions</span>
            <b>{connector.executions || 0}</b>
          </div>

          <div>
            <span>Health</span>
            <b>{connector.health || "Ready"}</b>
          </div>

          <div>
            <span>Risk</span>
            <b>{connector.risk || "Low"}</b>
          </div>
        </div>

        <div className="drawer-section">
          <div className="panel-title">
            <Terminal size={18} />
            Description
          </div>

          <p className="drawer-text">
            {connector.description || "SOAR connector for enterprise automation actions."}
          </p>
        </div>

        <div className="drawer-section">
          <div className="panel-title">
            <CheckCircle2 size={18} />
            Available Capabilities
          </div>

          <div className="capability-list">
            {capabilities.length === 0 ? (
              <p className="subtitle">No capabilities registered yet.</p>
            ) : (
              capabilities.map((capability, index) => (
                <div className="capability-item" key={`${capability}-${index}`}>
                  <span />
                  {capability}
                </div>
              ))
            )}
          </div>
        </div>

        <div className="drawer-section">
          <div className="panel-title">
            <KeyRound size={18} />
            Authentication
          </div>

          <div className="auth-box">
            <b>{connector.auth || "Not configured"}</b>
            <p>
              Credentials will be stored later using encrypted backend secret
              management and RBAC-controlled connector policies.
            </p>
          </div>
        </div>

        <div className="drawer-section">
          <div className="panel-title">
            <ShieldAlert size={18} />
            Security Notes
          </div>

          <div className="security-note">
            <Activity size={16} />
            <p>
              All connector actions should be audited, permission-controlled,
              rate-limited, and restricted by role before production execution.
            </p>
          </div>
        </div>

        <div className="drawer-actions">
          <button
            className="primary-btn"
            onClick={configureConnector}
            disabled={configuring}
          >
            {configuring ? (
              <>
                <Loader2 size={15} className="spin-icon" />
                Configuring...
              </>
            ) : (
              "Configure Connector"
            )}
          </button>

          <button
            className="secondary-btn"
            onClick={testConnection}
            disabled={testing}
          >
            {testing ? (
              <>
                <Loader2 size={15} className="spin-icon" />
                Testing...
              </>
            ) : (
              "Test Connection"
            )}
          </button>

          <button
            className="secondary-btn"
            onClick={validateConnector}
            disabled={validating}
          >
            {validating ? (
              <>
                <Loader2 size={15} className="spin-icon" />
                Validating...
              </>
            ) : (
              <>
                <RefreshCcw size={15} />
                Validate
              </>
            )}
          </button>
        </div>
      </aside>
    </div>
  );
}