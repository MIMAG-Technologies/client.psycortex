export type question = {
  question_number: string;
  question_text:string;
  options:{
    value:string;
    text:string;
  }[];
};

export type assesmentData = {
  pages: number;
  questions: question[];
};