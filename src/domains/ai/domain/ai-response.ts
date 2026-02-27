export interface AIResponse {
  result: string;
  provider: string;
  model: string;
  usage?: number;
  latencyMs?: number;
}
