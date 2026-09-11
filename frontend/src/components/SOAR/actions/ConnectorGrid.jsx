import ConnectorCard from "./ConnectorCard";

export default function ConnectorGrid({ connectors, onOpen }) {
  return (
    <div className="connector-grid">
      {connectors.map((connector) => (
        <ConnectorCard
          key={connector.name}
          connector={connector}
          onOpen={() => onOpen(connector)}
        />
      ))}
    </div>
  );
}