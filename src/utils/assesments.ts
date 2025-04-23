import { assesmentData, question } from "@/types/assesments";
import axios from "axios";

const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

// vl : options are in value:"" , label:"" type
// vt : options are in value:"" , text:"" type
// ad5 : options are not given in responce have to take (Strongly Agree,Agree,Uncertain,Disagree,Stronly Agree)
// vld : options are in value:"" , label:"" type but there will be data of test as well
// ol: options are present in list form
// oc: there are custom options Not at all,Midly but it didn't bother me much,Moderatetly it wasn't pleasant at times,Serverly it botherrd me a lot
// yn: Yes Not type option

const assesmentType = (slug: string) => {
  if (["wbs", "ies", "rrs", "sis", "scs"].includes(slug)) {
    return "vl";
  } else if (
    ["spiritual", "aggression", "suicidal-ideation-scale"].includes(slug)
  ) {
    return "ad5";
  } else if (
    ["schizophrenia", "scat", "academic", "pre-marital", "sas"].includes(slug)
  ) {
    return "vld";
  } else if (slug === "happiness") {
    return "vt";
  } else if (slug === "bdi") {
    return "ol";
  } else if (slug === "bai") {
    return "oc";
  } else if (slug === "adss") {
    return "yn";
  } else {
    throw new Error("Unknow Test");
  }
};

const get_VLD_Questions = async (slug: string) => {
  try {
    const res = await axios.get(
      `${baseUrl}/${slug}/a_get_questions.php?test_slug=${slug}&page=1`
    );
    const noOfPages: number = 1;
    let QuestionsList: any[] = res.data.questions;
    let questions: question[] = QuestionsList.map((question: any) => {
      return {
        question_number: question.id,
        question_text: question.text,
        options: question.options.map((option: any) => {
          return {
            value: option.value,
            text: option.text,
          };
        }),
      };
    });
    const assesmentData: assesmentData = {
      testInfo: res.data.test_info,
      pages: noOfPages,
      questions: questions,
    };
    return assesmentData;
  } catch (error) {
    throw new Error("Error in fetching Questions of " + slug + ":" + error);
  }
};

const getAssesmentQptions = (slug: string, is_positive: any) => {
  const positiveOrder = ["5", "4", "3", "2", "1"];
  const negativeOrder = ["1", "2", "3", "4", "5"];

  const getOptionsArray = (neutralText: string) => {
    let values;
    if (slug === "spiritual") {
      values = positiveOrder;
    } else {
      values = Number(is_positive) === 1 ? positiveOrder : negativeOrder;
    }

    return [
      { value: values[0], text: "Strongly Agree" },
      { value: values[1], text: "Disagree" },
      { value: values[2], text: neutralText },
      { value: values[3], text: "Agree" },
      { value: values[4], text: "Strongly Disagree" },
    ];
  };

  switch (slug) {
    case "spiritual":
      return getOptionsArray("Neutral");
    case "aggression":
      return getOptionsArray("Undecided");
    case "suicidal-ideation-scale":
      return getOptionsArray("Uncertain");
    case "bai":
      return [
        { text: "Not at all", value: "0" },
        { text: "Mildly but it didn't bother me much", value: "1" },
        { text: "Moderatetly it wasn't pleasant at times", value: "2" },
        { text: "Serverly-it botherrd me a lot", value: "3" },
      ];
    case "adss":
      return [
        { text: "Yes", value: "yes" },
        { text: "No", value: "no" },
      ];
    default:
      return [];
  }
};

const get_VL_VT_Question = async (slug: string, type: string) => {
  try {
    const res = await axios.get(
      `${baseUrl}/${slug}/a_get_questions.php?test_slug=${slug}&page=1`
    );

    const noOfPages: number = res.data.data.total_pages || 1;
    let QuestionsList: any[] = res.data.data.questions;

    for (let i = 1; i < noOfPages; i++) {
      const moreres = await axios.get(
        `${baseUrl}/${slug}/a_get_questions.php?test_slug=${slug}&page=${i + 1}`
      );
      const moreQuestions = moreres.data.data.questions;
      QuestionsList = QuestionsList.concat(moreQuestions);
    }
    let questions: question[] = QuestionsList.map((question: any) => {
      return {
        question_number: question.question_number,
        question_text: question.question_text,
        options: question.options.map((option: any) => {
          return {
            value: option.value,
            text: type === "vl" ? option.label : option.text,
          };
        }),
      };
    });
    const assesmentData: assesmentData = {
      pages: noOfPages,
      questions: questions,
    };

    return assesmentData;
  } catch (error) {
    throw new Error("Error in fetching Questions of " + slug + ":" + error);
  }
};

const get_AD5_OC_YN_Questions = async (slug: string) => {
  try {
    const res = await axios.get(
      `${baseUrl}/${slug}/a_get_questions.php?test_slug=${slug}&page=1`
    );
    const noOfPages: number = res.data.data.total_pages || 1;
    let QuestionsList: any[] = res.data.data.questions;
    for (let i = 1; i < noOfPages; i++) {
      const moreres = await axios.get(
        `${baseUrl}/${slug}/a_get_questions.php?test_slug=${slug}&page=${i + 1}`
      );
      const moreQuestions = moreres.data.data.questions;
      QuestionsList = QuestionsList.concat(moreQuestions);
    }
    let questions: question[] = QuestionsList.map((question: any) => {
      return {
        question_number: question.question_number,
        question_text: question.question_text,
        options: getAssesmentQptions(slug, question.is_positive),
      };
    });
    const assesmentData: assesmentData = {
      pages: noOfPages,
      questions: questions,
    };
    return assesmentData;
  } catch (error) {
    throw new Error("Error in fetching Questions of " + slug + ":" + error);
  }
};

const defaultresponce: assesmentData = {
  pages: 0,
  questions: [],
};

export const getQuestions = async (slug: string) => {
  try {
    const typeOfAssesment = assesmentType(slug);
    if (typeOfAssesment === "vl" || typeOfAssesment === "vt") {
      const res = await get_VL_VT_Question(slug, typeOfAssesment);
      return res;
    } else if (
      typeOfAssesment === "ad5" ||
      typeOfAssesment === "oc" ||
      typeOfAssesment === "yn"
    ) {
      const res = await get_AD5_OC_YN_Questions(slug);
      return res;
    } else if (typeOfAssesment === "vld") {
      const res = await get_VLD_Questions(slug);
      return res;
    } else {
      console.log("Not Implemented yet");
      return defaultresponce;
    }
  } catch (error) {
    console.log(error);
    return defaultresponce;
  }
};

export const submitAssesment = async (data: {
  user_id: string;
  test_slug: string;
  answers: any;
}) => {
  try {
    await axios.post(`${baseUrl}/${data.test_slug}/b_submit_answers.php`, data);
    return true;
  } catch (error) {
    return false;
  }
};
