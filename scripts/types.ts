export type ProcedureType = 'query' | 'mutation';

export interface ProcedureInfo {
  type: ProcedureType;
  name: string;
  description?: string;
  input?: string;
  output?: string;
  exampleInput?: string;
} 