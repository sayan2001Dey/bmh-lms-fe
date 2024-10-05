// Diagram state props
export interface GraphStateData {
  diagramNodeData: Array<go.ObjectData>;
  diagramLinkData: Array<go.ObjectData>;
  diagramModelData: go.ObjectData;
  skipsDiagramUpdate: boolean;
}