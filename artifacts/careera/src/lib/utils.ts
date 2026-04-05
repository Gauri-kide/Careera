import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const INTEREST_OPTIONS = [
  "Hackathons", "Workshops", "Competitions", "Tech Talks", 
  "Networking", "Coding", "Design", "Data Science", 
  "AI/ML", "Entrepreneurship", "Sports", "Arts"
];
