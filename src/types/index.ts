// User Types
export interface User {
  id: string;
  email: string;
  name: string;
  userType: "candidate" | "hr";
}

// Job Types
export interface Job {
  jobId: number;
  role: string;
  designation: string;
  jobStatus: "ACTIVE" | "INACTIVE";
  experience: string;
  department: string;
  location: string;
  postedOn: string;
  hr: {
    firstName: string;
    lastName: string;
    designation: string;
  };
}

// Filter Types
export interface JobFilters {
  jobStatus: string;
  department: string;
  location: string;
  experience: string;
}

// API Response Types
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface JobsResponse extends ApiResponse {
  jobs: Job[];
  count: number;
}
