export type RefinableAgentOutput = {
  canAdvance: boolean;
  needsClarification: boolean;
  clarifyingQuestions: string[];
};
