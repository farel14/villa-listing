export type Role = "USER" | "ADMIN";
export type InquiryStatus = "NEW" | "CONTACTED" | "CONFIRMED" | "CANCELLED";
export const INQUIRY_STATUSES: InquiryStatus[] = ["NEW", "CONTACTED", "CONFIRMED", "CANCELLED"];

export interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
}

export interface Named {
  slug: string;
  nameTr: string;
  nameEn: string;
}

export interface Villa {
  id: string;
  code: number;
  slug: string;
  name: string;
  district: string;
  descriptionTr: string;
  descriptionEn: string;
  pricePerNight: number;
  capacity: number;
  bedrooms: number;
  bathrooms: number;
  images: string[];
  isActive: boolean;
  region: Named;
  features: Named[];
  unavailable?: { startDate: string; endDate: string }[];
}

export interface SearchResult {
  items: Villa[];
  total: number;
  page: number;
  pageSize: number;
}

export interface Inquiry {
  id: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  nights: number;
  totalPrice: number;
  contactName: string;
  contactPhone: string | null;
  status: InquiryStatus;
  createdAt: string;
  villa: { name: string; code: number; slug: string };
  user: { email: string; name: string } | null;
}

export const CURRENCIES = ["TRY", "USD", "EUR", "GBP"] as const;
export type Currency = (typeof CURRENCIES)[number];

export interface Rates {
  base: "TRY";
  rates: Partial<Record<Currency, number>>;
  source: string;
  updatedAt: string;
  fallback: boolean;
}
