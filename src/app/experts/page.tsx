"use client";

import { useEffect, useState } from "react";
import OneExpertCard from "@/components/experts/OneExpertCard";
import { HiAdjustmentsHorizontal, HiXMark } from "react-icons/hi2";
import { FiSearch, FiChevronDown, FiChevronUp } from "react-icons/fi";
import { BsSortDown } from "react-icons/bs";
import Slider from "rc-slider";
import "rc-slider/assets/index.css";

import { BaseCounsellor, getFilters } from "@/utils/experts";
import { useCounsellorContext } from "@/context/CounsellorContext";

export default function AllExpertsPage() {
  const { counsellors, loading: counsellorsLoading } = useCounsellorContext();
  const [filteredCounsellors, setFilteredCounsellors] = useState<
    BaseCounsellor[]
  >([]);
  const [isFilterOpen, setIsFilterOpen] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [expandedSections, setExpandedSections] = useState({
    languages: false,
    specialties: false,
    genders: false,
  });
  const [selectedFilters, setSelectedFilters] = useState({
    languages: [] as string[],
    specialties: [] as string[],
    gender: "",
    priceRange: { min: 100, max: 5000 },
    minExperience: 0,
    sortBy: "rating", // rating, price, experience
  });

  const [filters, setFilters] = useState<{
    languages: string[];
    specialties: string[];
    genders: string[];
    priceRange: { min: number; max: number };
    experience: { value: number; label: string }[];
  }>({
    languages: [],
    specialties: [],
    genders: [],
    priceRange: { min: 100, max: 5000 },
    experience: [
      { value: 0, label: "Any" },
      { value: 1, label: "1 year" },
      { value: 3, label: "3 years" },
      { value: 5, label: "5 years" },
      { value: 7, label: "7 years" },
      { value: 10, label: "10+ years" },
    ],
  });
  
  const [loading, setLoading] = useState<boolean>(false);

  const fetchFilters = async () => {
    setLoading(true);
    try {
      const res = await getFilters();
      setFilters({
        ...filters,
        languages: res.languages,
        specialties: res.specialties,
        genders: res.genders,
        priceRange: res.priceRange,
      });
      setSelectedFilters((prev) => ({
        ...prev,
        priceRange: res.priceRange,
      }));
    } catch (error) {
      console.error("Error fetching filters:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFilters();
  }, []);

  // Initialize filtered counsellors when counsellors are loaded
  useEffect(() => {
    if (counsellors.length > 0) {
      setFilteredCounsellors(counsellors);
    }
  }, [counsellors]);

  // Toggle expanded sections
  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  // Filter counsellors based on selected filters
  useEffect(() => {
    if (counsellors.length === 0) return;

    const filtered = counsellors.filter((counsellor) => {
      // Filter by search term (name or title)
      const matchesSearch =
        searchTerm === "" ||
        counsellor.personalInfo.name
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        counsellor.professionalInfo.title
          .toLowerCase()
          .includes(searchTerm.toLowerCase());

      // Filter by languages
      const matchesLanguages =
        selectedFilters.languages.length === 0 ||
        counsellor.practiceInfo.languages.some((lang) =>
          selectedFilters.languages.includes(lang.language)
        );

      // Filter by specialties
      const matchesSpecialties =
        selectedFilters.specialties.length === 0 ||
        counsellor.practiceInfo.specialties.some((specialty) =>
          selectedFilters.specialties.includes(specialty)
        );

      // Fix for gender filtering - check if gender exists in the object
      const matchesGender =
        selectedFilters.gender === "" ||
        counsellor.personalInfo.gender?.toLowerCase() ===
          selectedFilters.gender.toLowerCase();
      // Fix price range filtering - if ANY rate is within range
      // const hasRateInRange = counsellor.sessionInfo.pricing.rates.some(rate => {
      //   const price = Number(rate.price) || 0;
      //   return price >= selectedFilters.priceRange.min && price <= selectedFilters.priceRange.max;
      // });

      // Filter by minimum experience
      const matchesExperience =
        counsellor.professionalInfo.yearsOfExperience >=
        selectedFilters.minExperience;

      return (
        matchesSearch &&
        matchesLanguages &&
        matchesSpecialties &&
        matchesGender &&
        // hasRateInRange &&
        matchesExperience
      );
    });

    // Sort the filtered results
    let sortedResults = [...filtered];

    switch (selectedFilters.sortBy) {
      case "rating":
        sortedResults.sort((a, b) => b.rating.average - a.rating.average);
        break;
      case "price":
        sortedResults.sort((a, b) => {
          const minPriceA = Math.min(
            ...a.sessionInfo.pricing.rates.map(
              (rate) => Number(rate.price) || Infinity
            )
          );
          const minPriceB = Math.min(
            ...b.sessionInfo.pricing.rates.map(
              (rate) => Number(rate.price) || Infinity
            )
          );
          return minPriceA - minPriceB;
        });
        break;
      case "experience":
        sortedResults.sort(
          (a, b) =>
            b.professionalInfo.yearsOfExperience -
            a.professionalInfo.yearsOfExperience
        );
        break;
      default:
        break;
    }

    setFilteredCounsellors(sortedResults);
  }, [counsellors, selectedFilters, searchTerm]);

  const handleFilterChange = (type: string, value: any) => {
    setSelectedFilters((prev) => ({
      ...prev,
      [type]: value,
    }));
  };

  const toggleFilterSelection = (type: string, value: string) => {
    setSelectedFilters((prev) => {
      const current = prev[type as keyof typeof prev] as string[];
      return {
        ...prev,
        [type]: current.includes(value)
          ? current.filter((item) => item !== value)
          : [...current, value],
      };
    });
  };

  const resetFilters = () => {
    setSelectedFilters({
      languages: [],
      specialties: [],
      gender: "",
      priceRange: filters.priceRange,
      minExperience: 0,
      sortBy: "rating",
    });
    setSearchTerm("");
    setExpandedSections({
      languages: false,
      specialties: false,
      genders: false,
    });
  };

  const toggleMobileFilter = () => {
    setIsFilterOpen(!isFilterOpen);
  };

  // Render filter items with view more functionality
  const renderFilterItems = (
    items: string[],
    type: "languages" | "specialties",
    selectedItems: string[],
    isMobile: boolean = false
  ) => {
    const visibleItems = expandedSections[type] ? items : items.slice(0, 5);
    const prefix = isMobile ? "mob-" : "";

    return (
      <>
        <div className="space-y-2 overflow-y-auto">
          {visibleItems.map((item) => (
            <div key={item} className="flex items-center">
              <input
                type="checkbox"
                id={`${prefix}${type}-${item}`}
                checked={selectedItems.includes(item)}
                onChange={() => toggleFilterSelection(type, item)}
                className="h-4 w-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
              />
              <label
                htmlFor={`${prefix}${type}-${item}`}
                className="ml-2 text-sm text-gray-700"
              >
                {item}
              </label>
            </div>
          ))}
        </div>

        {items.length > 5 && (
          <button
            type="button"
            onClick={() => toggleSection(type)}
            className="mt-2 text-sm text-purple-600 flex items-center hover:underline"
          >
            {expandedSections[type] ? (
              <>
                View less <FiChevronUp className="ml-1" />
              </>
            ) : (
              <>
                View more ({items.length - 5} more){" "}
                <FiChevronDown className="ml-1" />
              </>
            )}
          </button>
        )}
      </>
    );
  };

  // Render gender options with view more functionality
  const renderGenderOptions = (isMobile: boolean = false) => {
    const visibleGenders = expandedSections.genders
      ? filters.genders
      : filters.genders.slice(0, 5);
    const prefix = isMobile ? "mob-" : "";

    return (
      <>
        <div className="space-y-2">
          {visibleGenders.map((gender) => (
            <div key={gender} className="flex items-center">
              <input
                type="radio"
                id={`${prefix}gender-${gender}`}
                name={`${prefix}gender`}
                checked={selectedFilters.gender === gender}
                onChange={() => handleFilterChange("gender", gender)}
                className="h-4 w-4 text-purple-600 border-gray-300 focus:ring-purple-500"
              />
              <label
                htmlFor={`${prefix}gender-${gender}`}
                className="ml-2 text-sm text-gray-700"
              >
                {gender}
              </label>
            </div>
          ))}
          <div className="flex items-center">
            <input
              type="radio"
              id={`${prefix}gender-any`}
              name={`${prefix}gender`}
              checked={selectedFilters.gender === ""}
              onChange={() => handleFilterChange("gender", "")}
              className="h-4 w-4 text-purple-600 border-gray-300 focus:ring-purple-500"
            />
            <label
              htmlFor={`${prefix}gender-any`}
              className="ml-2 text-sm text-gray-700"
            >
              Any
            </label>
          </div>
        </div>

        {filters.genders.length > 5 && (
          <button
            type="button"
            onClick={() => toggleSection("genders")}
            className="mt-2 text-sm text-purple-600 flex items-center hover:underline"
          >
            {expandedSections.genders ? (
              <>
                View less <FiChevronUp className="ml-1" />
              </>
            ) : (
              <>
                View more ({filters.genders.length - 5} more){" "}
                <FiChevronDown className="ml-1" />
              </>
            )}
          </button>
        )}
      </>
    );
  };

  return (
    <div className="relative bg-gradient-to-r from-purple-50 to-indigo-50">
      {/* Header and Search bar */}
      <div className="p-6 w-full bg-white shadow-sm">
        <div className=" mx-auto">
          <h1 className="text-3xl font-bold text-purple-800 mb-4">
            Find Your Perfect Expert
          </h1>
          <p className="text-gray-600 mb-4">
            Connect with experienced counsellors tailored to your specific needs
          </p>
          <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
            <div className="relative flex-grow">
              <input
                type="text"
                placeholder="Search experts by name or title..."
                className="w-full p-3 pl-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <button
                className="md:hidden absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-600"
                onClick={toggleMobileFilter}
              >
                {isFilterOpen ? (
                  <HiXMark size={20} />
                ) : (
                  <HiAdjustmentsHorizontal size={20} />
                )}
              </button>
            </div>

            {/* Sort By - moved from filter sidebar */}
            <div className="relative md:w-72">
              <select
                value={selectedFilters.sortBy}
                onChange={(e) => handleFilterChange("sortBy", e.target.value)}
                className="w-full p-3 pl-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="rating">Sort by Rating (High to Low)</option>
                <option value="price">Sort by Price (Low to High)</option>
                <option value="experience">
                  Sort by Experience (High to Low)
                </option>
              </select>
              <BsSortDown
                size={20}
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-purple-600"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="flex border-t border-purple-200 relative">
        {/* Filter sidebar - desktop */}
        <div className="hidden md:block w-[280px] bg-white shadow-sm p-4 sticky top-0 overflow-y-auto">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-semibold text-purple-800">Filters</h2>
            <button
              onClick={resetFilters}
              className="text-purple-600 text-sm hover:underline"
            >
              Reset All
            </button>
          </div>

          {/* Languages Filter */}
          <div className="mb-6">
            <h3 className="font-medium text-gray-700 mb-2">Languages</h3>
            {renderFilterItems(
              filters.languages,
              "languages",
              selectedFilters.languages
            )}
          </div>

          {/* Specialties Filter */}
          <div className="mb-6">
            <h3 className="font-medium text-gray-700 mb-2">Specialties</h3>
            {renderFilterItems(
              filters.specialties,
              "specialties",
              selectedFilters.specialties
            )}
          </div>

          {/* Gender Filter */}
          <div className="mb-6">
            <h3 className="font-medium text-gray-700 mb-2">Gender</h3>
            {renderGenderOptions()}
          </div>

          {/* Price Range Filter */}
          <div className="mb-6">
            <h3 className="font-medium text-gray-700 mb-2">Price Range</h3>
            <div className="px-2">
              <Slider
                range
                min={filters.priceRange.min}
                max={filters.priceRange.max}
                value={[
                  selectedFilters.priceRange.min,
                  selectedFilters.priceRange.max,
                ]}
                onChange={(value: number | number[]) => {
                  if (Array.isArray(value)) {
                    handleFilterChange("priceRange", {
                      min: value[0],
                      max: value[1],
                    });
                  }
                }}
                className="mb-4"
                railStyle={{ backgroundColor: "#e9d5ff", height: 6 }}
                trackStyle={[{ backgroundColor: "#8b5cf6", height: 6 }]}
                handleStyle={[
                  {
                    backgroundColor: "#fff",
                    borderColor: "#8b5cf6",
                    height: 18,
                    width: 18,
                    marginTop: -6,
                  },
                  {
                    backgroundColor: "#fff",
                    borderColor: "#8b5cf6",
                    height: 18,
                    width: 18,
                    marginTop: -6,
                  },
                ]}
              />
              <div className="flex justify-between text-sm text-gray-600">
                <span>₹{selectedFilters.priceRange.min}</span>
                <span>₹{selectedFilters.priceRange.max}</span>
              </div>
            </div>
          </div>

          {/* Experience Filter */}
          <div className="mb-6">
            <h3 className="font-medium text-gray-700 mb-2">
              Minimum Experience
            </h3>
            <select
              value={selectedFilters.minExperience}
              onChange={(e) =>
                handleFilterChange("minExperience", Number(e.target.value))
              }
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              {filters.experience.map((exp) => (
                <option key={exp.value} value={exp.value}>
                  {exp.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Mobile filter panel - modified to slide up from bottom */}
        <div
          className={`fixed inset-0 bg-gray-800 bg-opacity-75 z-50 md:hidden transition-opacity duration-300 ${
            isFilterOpen ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
        >
          <div
            className={`absolute inset-x-0 bottom-0 h-[90%] bg-white shadow-xl transform transition-transform duration-300 rounded-t-2xl ${
              isFilterOpen ? "translate-y-0" : "translate-y-full"
            }`}
          >
            <div className="p-4 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-lg font-semibold text-purple-800">Filters</h2>
              <button onClick={toggleMobileFilter}>
                <HiXMark size={24} className="text-gray-600" />
              </button>
            </div>

            <div
              className="p-4 overflow-y-auto"
              style={{ height: "calc(100% - 60px)" }}
            >
              <button
                onClick={resetFilters}
                className="w-full mb-4 p-2 text-center rounded-md text-purple-600 border border-purple-600"
              >
                Reset All Filters
              </button>

              {/* Languages Filter */}
              <div className="mb-6">
                <h3 className="font-medium text-gray-700 mb-2">Languages</h3>
                {renderFilterItems(
                  filters.languages,
                  "languages",
                  selectedFilters.languages,
                  true
                )}
              </div>

              {/* Specialties Filter */}
              <div className="mb-6">
                <h3 className="font-medium text-gray-700 mb-2">Specialties</h3>
                {renderFilterItems(
                  filters.specialties,
                  "specialties",
                  selectedFilters.specialties,
                  true
                )}
              </div>

              {/* Gender Filter */}
              <div className="mb-6">
                <h3 className="font-medium text-gray-700 mb-2">Gender</h3>
                {renderGenderOptions(true)}
              </div>

              {/* Price Range Filter */}
              <div className="mb-6">
                <h3 className="font-medium text-gray-700 mb-2">Price Range</h3>
                <div className="px-2">
                  <Slider
                    range
                    min={filters.priceRange.min}
                    max={filters.priceRange.max}
                    value={[
                      selectedFilters.priceRange.min,
                      selectedFilters.priceRange.max,
                    ]}
                    onChange={(value: number | number[]) => {
                      if (Array.isArray(value)) {
                        handleFilterChange("priceRange", {
                          min: value[0],
                          max: value[1],
                        });
                      }
                    }}
                    className="mb-4"
                    railStyle={{ backgroundColor: "#e9d5ff", height: 6 }}
                    trackStyle={[{ backgroundColor: "#8b5cf6", height: 6 }]}
                    handleStyle={[
                      {
                        backgroundColor: "#fff",
                        borderColor: "#8b5cf6",
                        height: 18,
                        width: 18,
                        marginTop: -6,
                      },
                      {
                        backgroundColor: "#fff",
                        borderColor: "#8b5cf6",
                        height: 18,
                        width: 18,
                        marginTop: -6,
                      },
                    ]}
                  />
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>₹{selectedFilters.priceRange.min}</span>
                    <span>₹{selectedFilters.priceRange.max}</span>
                  </div>
                </div>
              </div>

              {/* Experience Filter */}
              <div className="mb-6">
                <h3 className="font-medium text-gray-700 mb-2">
                  Minimum Experience
                </h3>
                <select
                  value={selectedFilters.minExperience}
                  onChange={(e) =>
                    handleFilterChange("minExperience", Number(e.target.value))
                  }
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  {filters.experience.map((exp) => (
                    <option key={exp.value} value={exp.value}>
                      {exp.label}
                    </option>
                  ))}
                </select>
              </div>

              <button
                onClick={toggleMobileFilter}
                className="w-full p-3 bg-purple-600 text-white rounded-md font-medium hover:bg-purple-700 transition"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>

        {/* Results area - using full width */}
        <div className="flex-1 p-6">
          <div className="mb-4 flex flex-wrap items-center justify-between bg-white p-4 rounded-lg shadow-sm">
            <h2 className="text-xl font-semibold text-purple-800">
              Expert Results
            </h2>
            <p className="text-gray-600">
              {filteredCounsellors.length}{" "}
              {filteredCounsellors.length === 1 ? "expert" : "experts"} found
            </p>
          </div>

          {loading || counsellorsLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600"></div>
            </div>
          ) : filteredCounsellors.length === 0 ? (
            <div className="text-center py-16 px-4 bg-white rounded-lg shadow-sm">
              <h3 className="text-lg font-medium text-gray-800 mb-2">
                No experts match your filters
              </h3>
              <p className="text-gray-600 mb-6">
                Try adjusting your search criteria or reset filters
              </p>
              <button
                onClick={resetFilters}
                className="px-6 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="grid lg:grid-cols-3 gap-6 md:grid-cols-2 sm:grid-cols-1">
              {filteredCounsellors.map((counsellor) => (
                <OneExpertCard
                  {...counsellor}
                  key={counsellor.id}
                  variant="simple"
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
