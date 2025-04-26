import { TestDetails } from "@/types/test";
import axios from "axios";
import { BaseCounsellor } from "./experts";

const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

export type SearchResult = {
  tests: TestDetails[];
  counsellors: BaseCounsellor[];
};
export const search = async (query: string) => {
  try {
    const response = await axios.get(`${baseUrl}/search/search.php?q=${query}`);
    const tests: TestDetails[] = response.data.tests;
    const counsellors = response.data.counsellors;
    let resData: BaseCounsellor[] = [];
    counsellors.forEach((expert: any) => {
      resData.push({
        id: expert.id,
        personalInfo: {
          name: expert.personalInfo.name,
          profileImage: expert.personalInfo.profileImage,
          gender: expert.personalInfo.gender,
        },
        professionalInfo: {
          title: expert.professionalInfo.title,
          yearsOfExperience: expert.professionalInfo.yearsOfExperience,
        },
        practiceInfo: {
          specialties: expert.practiceInfo.specialties,
          languages: expert.practiceInfo.languages,
        },
        sessionInfo: {
          availability: {
            communicationModes:
              expert.sessionInfo.availability.communicationModes,
          },
          pricing: {
            currency: expert.sessionInfo.pricing.defaultCurrency,
            rates: expert.sessionInfo.pricing.rates,
          },
        },
        rating: {
          average: expert.metrics.averageRating,
        },
      });
    });
    const result: SearchResult = {
      tests,
      counsellors: resData,
    };
    return result;
  } catch (error) {
    console.error(error);
    return {
      tests: [],
      counsellors: [],
    };
  }
};
