"use client";

import { useState } from "react";
import { Filter, ChevronDown } from "lucide-react";
import { JobFilters as JobFiltersType } from "@/src/types";
import {
  DEPARTMENTS,
  LOCATIONS,
  EXPERIENCE_LEVELS,
  JOB_STATUS,
} from "@/src/constants";

interface JobFiltersProps {
  onFiltersChange: (filters: JobFiltersType) => void;
}

export default function JobFilters({ onFiltersChange }: JobFiltersProps) {
  const [filters, setFilters] = useState<JobFiltersType>({
    jobStatus: "",
    department: "",
    location: "",
    experience: "",
  });

  const handleFilterChange = (key: string, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFiltersChange(newFilters);
  };

  return (
    <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 mb-8">
      <div className="flex items-center gap-3 mb-6">
        <Filter className="h-6 w-6 text-blue-400" />
        <h3 className="text-xl font-semibold text-white">Filter Jobs</h3>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Job Status Filter */}
        <div className="space-y-3">
          <label className="block text-sm font-medium text-gray-300">
            Job Status
          </label>
          <div className="relative">
            <select
              value={filters.jobStatus}
              onChange={(e) => handleFilterChange("jobStatus", e.target.value)}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200"
            >
              <option value="">All Status</option>
              {Object.entries(JOB_STATUS).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
          </div>
        </div>

        {/* Department Filter */}
        <div className="space-y-3">
          <label className="block text-sm font-medium text-gray-300">
            Department
          </label>
          <div className="relative">
            <select
              value={filters.department}
              onChange={(e) => handleFilterChange("department", e.target.value)}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200"
            >
              <option value="">All Departments</option>
              {DEPARTMENTS.map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
          </div>
        </div>

        {/* Location Filter */}
        <div className="space-y-3">
          <label className="block text-sm font-medium text-gray-300">
            Location
          </label>
          <div className="relative">
            <select
              value={filters.location}
              onChange={(e) => handleFilterChange("location", e.target.value)}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200"
            >
              <option value="">All Locations</option>
              {LOCATIONS.map((location) => (
                <option key={location} value={location}>
                  {location}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
          </div>
        </div>

        {/* Experience Filter */}
        <div className="space-y-3">
          <label className="block text-sm font-medium text-gray-300">
            Experience
          </label>
          <div className="relative">
            <select
              value={filters.experience}
              onChange={(e) => handleFilterChange("experience", e.target.value)}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200"
            >
              <option value="">All Experience</option>
              {Object.entries(EXPERIENCE_LEVELS).map(([key, value]) => (
                <option key={key} value={key}>
                  {value === "LESS_THAN_2" && "< 2 years"}
                  {value === "TWO_TO_FIVE" && "2-5 years"}
                  {value === "FIVE_TO_EIGHT" && "5-8 years"}
                  {value === "EIGHT_TO_TWELVE" && "8-12 years"}
                  {value === "MORE_THAN_12" && "12+ years"}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
          </div>
        </div>
      </div>
    </div>
  );
}
