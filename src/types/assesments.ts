export type question = {
  question_number: string;
  question_text: string;
  options: {
    value: string | number;
    text: string;
  }[];
};

export type assesmentData = {
  pages: number;
  questions: question[];
  testInfo?: {
    name: string;
    description: string;
    instructions: string;
    estimated_time: string;
    total_questions: number;
  };
};
