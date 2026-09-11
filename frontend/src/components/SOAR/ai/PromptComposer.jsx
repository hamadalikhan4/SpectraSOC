import { Bot, Send, Sparkles } from "lucide-react";

import { promptTemplates } from "./aiBuilderData";

export default function PromptComposer({ prompt, setPrompt, onGenerate }) {
  return (
    <div className="spectra-glass-card prompt-composer">
      <div className="ai-panel-header">
        <div>
          <h2>Natural Language Prompt</h2>
          <p>Describe the incident response automation you want to create.</p>
        </div>

        <span className="ai-live-pill">
          <Bot size={14} />
          AI Ready
        </span>
      </div>

      <textarea
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="Example: Build a playbook for phishing email investigation..."
      />

      <div className="prompt-actions">
        <button className="primary-btn" onClick={onGenerate}>
          <Send size={16} />
          Generate Playbook
        </button>

        <button className="secondary-btn" onClick={() => setPrompt("")}>
          Clear
        </button>
      </div>

      <div className="prompt-template-grid">
        {promptTemplates.map((template) => (
          <button
            key={template.title}
            className="prompt-template-card"
            onClick={() => {
              setPrompt(template.prompt);
            }}
          >
            <Sparkles size={15} />

            <div>
              <h4>{template.title}</h4>
              <p>{template.prompt}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}