import { Shield, Clock3, Wifi, AlertTriangle } from "lucide-react";
import { useEffect, useState } from "react";

export default function SOCHeader() {
  const [time, setTime] = useState("");

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();

      setTime(
        now.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        })
      );
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="soc-header">

      <div className="soc-left">

        <div className="soc-logo">

          <Shield size={26} />

        </div>

        <div>

          <h2>SpectraSOC</h2>

          <p>Security Operations Center</p>

        </div>

      </div>

      <div className="soc-status">

        <div className="soc-chip">
          <Wifi size={15} />
          Connected
        </div>

        <div className="soc-chip">
          <Clock3 size={15} />
          {time}
        </div>

        <div className="soc-chip danger">
          <AlertTriangle size={15} />
          Threat Level HIGH
        </div>

      </div>

    </div>
  );
}