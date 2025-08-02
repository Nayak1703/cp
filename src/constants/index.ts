// Experience Levels
export const EXPERIENCE_LEVELS = {
  "1": "LESS_THAN_2",
  "2": "TWO_TO_FIVE",
  "3": "FIVE_TO_EIGHT",
  "4": "EIGHT_TO_TWELVE",
  "5": "MORE_THAN_12",
} as const;

export const EXPERIENCE_LABELS = {
  LESS_THAN_2: "< 2 years",
  TWO_TO_FIVE: "2-5 years",
  FIVE_TO_EIGHT: "5-8 years",
  EIGHT_TO_TWELVE: "8-12 years",
  MORE_THAN_12: "12+ years",
} as const;

// Departments
export const DEPARTMENTS = [
  "ENGINEERING",
  "MARKETING",
  "QA",
  "DEVOPS",
  "PRODUCT_MANAGER",
] as const;

// Locations
export const LOCATIONS = [
  "MUMBAI",
  "BHUBANESWAR",
  "DELHI",
  "BANGALORE",
  "HYDERABAD",
] as const;

// Job Status
export const JOB_STATUS = {
  ACTIVE: "Active",
  INACTIVE: "Inactive",
} as const;
