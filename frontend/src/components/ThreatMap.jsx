import { useEffect, useState } from "react";
import API from "../api/api";
import {
  ComposableMap,
  Geographies,
  Geography,
  Marker,
} from "react-simple-maps";

const geoUrl = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

const countryCoordinates = {
  Russia: [37.6173, 55.7558],
  USA: [-77.0369, 38.9072],
  "United States": [-77.0369, 38.9072],
  China: [116.4074, 39.9042],
  Germany: [13.405, 52.52],
  Pakistan: [73.0479, 33.6844],
  India: [77.209, 28.6139],
  France: [2.3522, 48.8566],
  Netherlands: [4.9041, 52.3676],
  Brazil: [-47.8825, -15.7942],
  Canada: [-75.6972, 45.4215],
  "United Kingdom": [-0.1276, 51.5072],
  UK: [-0.1276, 51.5072],
};

export default function ThreatMap() {
  const [threats, setThreats] = useState([]);

  useEffect(() => {
    loadThreats();
  }, []);

  const loadThreats = async () => {
    try {
      const res = await API.get("/api/v1/threat-intel/recent");
      const records = res.data.records || [];

      const countryCounts = {};

      records.forEach((record) => {
        const country =
          record?.data?.geo?.country ||
          record?.data?.data?.geo?.country ||
          "Unknown";

        if (country !== "Unknown") {
          countryCounts[country] = (countryCounts[country] || 0) + 1;
        }
      });

      const mappedThreats = Object.entries(countryCounts)
        .map(([country, count]) => ({
          country,
          count,
          coordinates: countryCoordinates[country],
        }))
        .filter((item) => item.coordinates);

      setThreats(mappedThreats);
    } catch (error) {
      console.error("Failed to load threat map data", error);
    }
  };

  return (
    <div className="card">
      <h3>Interactive Global Threat Map</h3>

      <ComposableMap
        projectionConfig={{ scale: 145 }}
        style={{ width: "100%", height: "420px" }}
      >
        <Geographies geography={geoUrl}>
          {({ geographies }) =>
            geographies.map((geo) => (
              <Geography
                key={geo.rsmKey}
                geography={geo}
                style={{
                  default: {
                    fill: "#111827",
                    stroke: "#334155",
                    outline: "none",
                  },
                  hover: {
                    fill: "#1e293b",
                    stroke: "#38bdf8",
                    outline: "none",
                  },
                  pressed: {
                    fill: "#0f172a",
                    stroke: "#38bdf8",
                    outline: "none",
                  },
                }}
              />
            ))
          }
        </Geographies>

        {threats.map((t) => (
          <Marker key={t.country} coordinates={t.coordinates}>
            <circle r={8} fill="#ef4444" />
            <text
              textAnchor="middle"
              y={-12}
              style={{
                fill: "#ffffff",
                fontSize: "10px",
                fontWeight: "bold",
              }}
            >
              {t.country} {t.count}
            </text>
          </Marker>
        ))}
      </ComposableMap>

      {threats.length === 0 && (
        <p className="subtitle">
          No geo-based IOC data found yet. Analyze IP addresses first.
        </p>
      )}
    </div>
  );
}