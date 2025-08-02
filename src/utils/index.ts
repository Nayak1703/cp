import { EXPERIENCE_LABELS } from "@/src/constants";

// Date formatting
export const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

// Experience text formatting
export const getExperienceText = (experience: string): string => {
  return (
    EXPERIENCE_LABELS[experience as keyof typeof EXPERIENCE_LABELS] ||
    experience
  );
};
