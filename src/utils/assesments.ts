import { Me } from "@/context/AuthContext";
import { assesmentData, question } from "@/types/assesments";
import axios from "axios";

// Define a more flexible user type for the functions
type UserData = {
  id?: string;
  uid?: string;
  personalInfo?: {
    gender?: string;
    [key: string]: any;
  };
  [key: string]: any;
};

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
    [
      "spiritual",
      "aggression",
      "suicidal-ideation-scale",
      "marital-adjustment",
    ].includes(slug)
  ) {
    return "ad5";
  } else if (
    [
      "schizophrenia",
      "scat",
      "academic",
      "pre-marital",
      "sas",
      "ems",
      "pst",
      "ses",
    ].includes(slug)
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

const get_VLD_Questions = async (slug: string, userData?: UserData) => {
  try {
    // Get gender from different user objects
    const gender = userData?.personalInfo?.gender;
    console.log(userData);

    const genderParam = slug === "sas" && gender ? `&gender=${gender}` : "";

    const url = `${baseUrl}/${slug}/a_get_questions.php?test_slug=${slug}${genderParam}`;
    console.log("Fetching from URL:", url);

    const res = await axios.get(url);
    console.log(
      "Response data structure:",
      JSON.stringify(res.data).substring(0, 200) + "..."
    );

    const noOfPages: number = 1;
    let QuestionsList: any[] = [];

    // Handle different response structures
    if (res.data.questions) {
      QuestionsList = res.data.questions;
    } else if (res.data.data?.questions) {
      QuestionsList = res.data.data.questions;
    } else {
      console.error("Unexpected response structure:", res.data);
      throw new Error(
        "Unexpected response structure: questions array not found"
      );
    }

    let questions: question[] = QuestionsList.map((question: any) => {
      return {
        question_number: question.id || question.question_number,
        question_text: question.text || question.question_text,
        options: Array.isArray(
          ["pre-marital", "sas"].includes(slug)
            ? question.answer_options
            : question.options
        )
          ? (["pre-marital", "sas"].includes(slug)
              ? question.answer_options
              : question.options
            ).map((option: any) => {
              return {
                value: option.value,
                text:
                  slug !== "sas" && slug !== "pre-marital"
                    ? option.text
                    : option.label || option.text,
              };
            })
          : [],
      };
    });

    const assesmentData: assesmentData = {
      testInfo: res.data.test_info || res.data.data?.test_info,
      pages: noOfPages,
      questions: questions,
    };
    return assesmentData;
  } catch (error) {
    console.error("Error in get_VLD_Questions:", error);
    console.error("For test slug:", slug);
    throw new Error("Error in fetching Questions of " + slug + ":" + error);
  }
};

const getAssesmentQptions = (slug: string, is_positive: any) => {
  const positiveOrder = [5, 4, 3, 2, 1];
  const negativeOrder = [1, 2, 3, 4, 5];

  const getOptionsArray = (neutralText: string) => {
    let values;
    if (slug === "spiritual") {
      values = positiveOrder;
    } else {
      values = Number(is_positive) === 1 ? positiveOrder : negativeOrder;
    }

    if (neutralText === "Undecided") {
      return [
        { value: 1, text: "Strongly Agree" },
        { value: 2, text: "Agree" },
        { value: 3, text: "Undecided" },
        { value: 4, text: "Disagree" },
        { value: 5, text: "Strongly Disagree" },
      ];
    }

    return [
      { value: values[0], text: "Strongly Agree" },
      { value: values[1], text: "Agree" },
      { value: values[2], text: neutralText },
      { value: values[3], text: "Disagree" },
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
    case "marital-adjustment":
      return [
        { text: "Always", value: 3 },
        { text: "Sometime", value: 2 },
        { text: "Never", value: 1 },
      ];
    case "bai":
      return [
        { text: "Not at all", value: "0" },
        { text: "Mildly but it didn't bother me much", value: 1 },
        { text: "Moderatetly it wasn't pleasant at times", value: 2 },
        { text: "Serverly-it botherrd me a lot", value: 3 },
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
            value: slug === "happiness" ? 6 - option.value : option.value,
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
    // Handle special case for marital-adjustment
    const urlSlug = slug === "marital-adjustment" ? "marital" : slug;

    const res = await axios.get(
      `${baseUrl}/${urlSlug}/a_get_questions.php?test_slug=${slug}&page=1`
    );
    const noOfPages: number = res.data.data.total_pages || 1;
    let QuestionsList: any[] = res.data.data.questions;
    for (let i = 1; i < noOfPages; i++) {
      const moreres = await axios.get(
        `${baseUrl}/${urlSlug}/a_get_questions.php?test_slug=${slug}&page=${
          i + 1
        }`
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

const get_BDI_Questions = async (slug: string) => {
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
        options: question.options.map((optionText: string, index: number) => {
          return {
            value: index.toString(),
            text: optionText,
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

const defaultresponce: assesmentData = {
  pages: 0,
  questions: [],
};

const get_Sucidal_Questions = async (slug: string) => {
  try {
    const res = await axios.get(
      `${baseUrl}/suicidal-ideation-scale/a_get_questions.php?test_slug=suicidal-ideation-scale`
    );
    const noOfPages: number = res.data.data.total_pages || 1;
    let QuestionsList: any[] = res.data.data.questions;
    let questions: question[] = QuestionsList.map((question: any) => {
      return {
        question_number: question.question_number,
        question_text: question.question_text,
        options: [
          {
            value: "strongly_agree",
            text: "Strongly Agree",
          },
          {
            value: "agree",
            text: "Agree",
          },
          {
            value: "uncertain",
            text: "Uncertain",
          },
          {
            value: "disagree",
            text: "Disagree",
          },
          {
            value: "strongly_disagree",
            text: "Strongly Disagree",
          },
        ],
      };
    });
    const assesmentData: assesmentData = {
      pages: noOfPages,
      questions: questions,
    };
    return assesmentData;
  } catch (error) {
    console.log(error);
    return defaultresponce;
  }
};

export const getQuestions = async (slug: string, userData: any) => {
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
      if (slug === "suicidal-ideation-scale") {
        const res = await get_Sucidal_Questions(slug);
        return res;
      }
      const res = await get_AD5_OC_YN_Questions(slug);
      return res;
    } else if (typeOfAssesment === "vld") {
      const res = await get_VLD_Questions(slug, userData);
      return res;
    } else if (typeOfAssesment === "ol") {
      const res = await get_BDI_Questions(slug);
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

export const submitAssesment = async (
  data: {
    user_id: string;
    test_slug: string;
    answers: any;
  },
  me: Me
) => {
  try {
    // Check if the test is VLD type and transform answers if needed
    const testType = assesmentType(data.test_slug);
    let requestData: any = { ...data };

    if (testType === "vld") {
      // Transform from object format to array format for VLD tests
      if (!Array.isArray(data.answers)) {
        const answersArray = Object.entries(data.answers).map(
          ([key, value]) => ({
            question_id: parseInt(key),
            value: value,
          })
        );
        requestData.answers = answersArray;
      }
    }
    if (
      data.test_slug === "scat" ||
      data.test_slug === "academic" ||
      data.test_slug === "sas"
    ) {
      requestData = { ...requestData, gender: me.personalInfo.gender };
    }
    console.log(requestData);

    await axios.post(
      `${baseUrl}/${
        data.test_slug === "marital-adjustment" ? "marital" : data.test_slug
      }/b_submit_answers.php`,
      requestData
    );
    return true;
  } catch (error) {
    return false;
  }
};
