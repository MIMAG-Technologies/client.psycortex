import axios from "axios";

const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
export type BaseCounsellor = {
  id: string;
  personalInfo: {
    name: string;
    profileImage: string;
  };
  professionalInfo: {
    title: string;
    yearsOfExperience: number;
  };
  practiceInfo: {
    specialties: string[];
    languages: {
      language: string;
      proficiencyLevel: string;
    }[];
  };
  sessionInfo: {
    availability: {
      communicationModes: string[];
    };
    pricing: {
      currency: string;
      rates: any[];
    };
  };
  rating: {
    average: number;
  };
};
export const getAllCounsellors = async () => {
  try {
    const res = await axios.get(`${baseUrl}/counsellor/get_counsellors.php`);
    const data = res.data.data;

    let resData: BaseCounsellor[] = [];
    data.forEach((expert: any) => {
      resData.push({
        id: expert.id,
        personalInfo: {
          name: expert.personalInfo.name,
          profileImage: expert.personalInfo.profileImage
        },
        professionalInfo: {
          title: expert.professionalInfo.title,
          yearsOfExperience: expert.professionalInfo.yearsOfExperience
        },
        practiceInfo: {
          specialties: expert.practiceInfo.specialties,
          languages: expert.practiceInfo.languages
        },
        sessionInfo: {
          availability: {
            communicationModes: expert.sessionInfo.availability.communicationModes
          },
          pricing: {
            currency: expert.sessionInfo.pricing.defaultCurrency,
            rates: expert.sessionInfo.pricing.rates
          }
        },
        rating: {
          average: expert.metrics.averageRating
        }
      });
    });

    return resData;
  } catch (error) {
    console.error(error);
    return [];
  }
};

export type ScheduleType = {
  date: string;
  day: string;
  is_working_day: boolean;
  is_on_leave_period: boolean;
  leave_reason?: string;
  leave_until?: string;
  working_hours: {
    start: string;
    end: string;
  } | null;
  slots: {
    time: string;
    is_available: boolean;
    status: string;
    leave_reason?: string;
    leave_until?: string;
  }[];
};

export const getCounsellotSchedule = async (id: string) => {
  try {
    const res = await axios.get(
      `${baseUrl}/counsellor/get_counsellor_schedule.php?counsellorId=${id}`
    );
    return res.data.weeklySchedule as ScheduleType[];
  } catch (error) {
    console.error(error);
    return [];
  }
};

export type CounsellorDetails = {
  id: string;
  personalInfo: {
    name: string;
    dateOfBirth: string;
    gender: string;
    profileImage: string;
    biography: string;
    email: string;
    phone: string;
  };
  professionalInfo: {
    title: string;
    yearsOfExperience: number;
    education: {
      degree: string;
      field: string;
      institution: string;
      year: number;
    }[];
    licenses: {
      type: string;
      licenseNumber: string;
      issuingAuthority: string;
      validUntil: string;
    }[];
  };
  practiceInfo: {
    specialties: string[];
    languages: {
      language: string;
      proficiencyLevel: string;
    }[];
  };
  sessionInfo: {
    availability: {
      timeZone: string;
      weeklySchedule: {
        date: string;
        day: string;
        isWorkingDay: number;
        working_hours: {
          start: string;
          end: string;
        };
        unavailable_slots: any[];
      }[];
      communicationModes: string[];
    };
    pricing: {
      currency: string;
      rates: {
        sessionType: string;
        price: number;
        currency: string;
        sessionTitle: string;
        availabilityTypes: string[];
      }[];
    };
  };
  verificationStatus: {
    isVerified: boolean;
    documentsVerified: boolean;
    backgroundCheckDate: string;
  };
  metrics: {
    totalSessions: number;
    averageRating: number;
    totalReviews: number;
    responseRate: number;
    cancellationRate: number;
  };
  addresses: {
    address: string;
    city: string;
    state: string;
    pincode: string;
  }[];
};

export const getOneCounsellor = async (id: string) => {
  try {
    const res = await axios.get(
      `${baseUrl}/counsellor/get_counsellor_details.php?counsellorId=${id}`
    );
    return res.data.data as CounsellorDetails;
  } catch (error) {
    console.error("Error fetching counsellor details:", error);
    return null;
  }
};

export type FilterType = {
  languages: string[];
  specialties: string[];
  genders: string[];
  priceRange: {
    min: number;
    max: number;
  };
};

export const getFilters = async () => {
  try {
    const res = await axios.get(`${baseUrl}/filter/get_filters.php`);
    return res.data.data as FilterType;
  } catch (error) {
    console.error("Error fetching filters:", error);
    return {
      languages: [],
      specialties: [],
      genders: [],
      priceRange: {
        min: 500,
        max: 5000,
      },
    };
  }
};
