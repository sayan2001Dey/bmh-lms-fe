import { GraphNodeData } from "./graph-node-data.model";

export interface GraphNode {
  data: GraphNodeData,
  children: GraphNode[],
}
