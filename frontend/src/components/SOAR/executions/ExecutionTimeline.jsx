import { CheckCircle2, Clock, Loader2, XCircle } from "lucide-react";

export default function ExecutionTimeline({ steps = [] }) {
  const iconMap = {
    Completed: CheckCircle2,
    Running: Loader2,
    Failed: XCircle,
    Waiting: Clock,
    Queued: Clock,
  };

  return (
    <div className="execution-timeline">
      {steps.length === 0 ? (
        <p className="subtitle">No execution steps recorded yet.</p>
      ) : (
        steps.map((step, index) => {
          const Icon = iconMap[step.status] || Clock;

          return (
            <div className="timeline-step" key={`${step.name}-${index}`}>
              <div className={`timeline-step-icon ${step.status.toLowerCase()}`}>
                <Icon size={16} />
              </div>

              <div>
                <div className="timeline-step-top">
                  <h4>{step.name}</h4>
                  <span>{step.time}</span>
                </div>

                <p>{step.output}</p>

                <span className={`execution-status ${step.status.toLowerCase()}`}>
                  {step.status}
                </span>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}