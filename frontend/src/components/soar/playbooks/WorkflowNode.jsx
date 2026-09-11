export default function WorkflowNode({ node, active, onClick }) {
  return (
    <button className={`workflow-node ${active ? "active" : ""}`} onClick={onClick}>
      <span className={`node-type ${node.type.toLowerCase()}`}>{node.type}</span>
      <h3>{node.name}</h3>
      <p>{node.meta}</p>
    </button>
  );
}