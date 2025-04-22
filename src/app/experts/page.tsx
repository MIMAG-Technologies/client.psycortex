"use client"

import { useEffect, useState, useCallback } from "react";
import OneCounsellorCard from "@/components/experts/OneExpertCard";
import { HiAdjustmentsHorizontal, HiXMark } from "react-icons/hi2";

import {
  BaseCounsellor,
  getAllCounsellors,
  getFilters,
} from "@/utils/experts";


export default function AllExpertsPage() {
  const [counsellor, setCounsellor] = useState<BaseCounsellor[]>([]);
  const [isFilterOpen, setIsFilterOpen] = useState<boolean>(false);
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
    priceRange: { min: 500, max: 5000 },
    experience: [
      { value: 1, label: "1 year" },
      { value: 3, label: "3 years" },
      { value: 5, label: "5 years" },
      { value: 7, label: "7 years" },
      { value: 10, label: "10 years" },
    ],
  });
  const [loading, setLoading] = useState<boolean>(false);


  const fetchFilters = async () => {
    try {
      const res = await getFilters();
      setFilters({
        ...filters,
        languages: res.languages,
        specialties: res.specialties,
        genders: res.genders,
        priceRange: res.priceRange,
      });
    } catch (error) {
      console.error("Error fetching filters:", error);
    }
  };

  const fetchCounsellors = async () => {
    setLoading(true);
    try {
      const res = await getAllCounsellors();

console.log(res);

      setCounsellor(res);
    } catch (error) {
      console.error("Error fetching filtered counsellors:", error);
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    fetchFilters();
    fetchCounsellors();
  }, []);


  return (
    <div className="flex border-t border-primary-purple bg-[#f8f3fa] relative z-[1]">


      <div className="h-full w-[200px]">
        filters
      </div>
      <div className="grid lg:grid-cols-3 gap-6 p-6 w-full md:grid-cols-2 sm:grid-cols-1">
      {loading ? (
        <p>Loading...</p>
      ) : counsellor?.length === 0 ? (
        <p>No counsellors found.</p>
      ) : (
        counsellor?.map((oneCounsellor) => (
          <OneCounsellorCard {...oneCounsellor} key={oneCounsellor.id} />
        ))
      )}
      </div>
        </div>
  )

}

