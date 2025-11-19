
// Fix: Import `ComponentType` from React to resolve namespace error.
import type { ComponentType } from 'react';

export enum Role {
  CUSTOMER = 'CUSTOMER',
  PROVIDER = 'PROVIDER',
  ADMIN = 'ADMIN',
}

export interface User {
  id: string;
  name: string;
  mobile: string;
  role: Role;
  password?: string;
  email?: string; // Made optional for customers
  shopName?: string;
  shopAddress?: string;
  hasOnboarded?: boolean; // Added to track customer onboarding
  latitude?: number;
  longitude?: number;
  // New fields for Platform Architecture
  isVerified?: boolean; // For Admin verification
  walletBalance?: number;
  loyaltyPoints?: number;
  tier?: 'Silver' | 'Gold' | 'Platinum';
}

export interface Service {
  id:string;
  name: string;
  description: string;
  price: number;
  duration: number; // in minutes
  category: string;
  providerId: string;
  icon: ComponentType<{ className?: string }>;
  isInstant?: boolean; // New: For instant booking
  isHomeService?: boolean; // New: Available for home service
  homeServiceFee?: number; // New: Extra fee for home service
}

// Feat: New interface for group booking details
export interface GroupMemberServices {
  name: string; // e.g. "Person 1"
  serviceIds: string[];
}

export interface Booking {
  id: string;
  serviceIds: string[];
  customerId: string;
  providerId: string;
  dateTime: Date;
  totalAmount: number;
  platformFee: number;
  status: 'upcoming' | 'completed' | 'cancelled';
  peopleCount: number;
  rescheduled?: boolean; // Added to track if a booking has been rescheduled
  isHomeService?: boolean; // New: To track if it was a home service booking
  groupDetails?: GroupMemberServices[]; // New: For group booking details
  reviewId?: string; // Link to a review if one exists
}

export interface Offer {
  id: string;
  providerId: string;
  title: string;
  description: string;
  discountPercentage: number;
  serviceIds: string[]; // empty array means it applies to all services of the provider
}

export interface Query {
  id:string;
  userId: string;
  userName: string;
  subject: string;
  message: string;
  createdAt: Date;
}

export interface PlatformFeeConfig {
  type: 'percentage' | 'fixed' | 'none';
  value: number;
}

export interface Notification {
  id: string;
  message: string;
  type: 'success' | 'info' | 'error';
}

// New Interfaces for Platform Features

export interface Review {
  id: string;
  bookingId: string;
  providerId: string;
  customerId: string;
  rating: number; // 1-5
  comment: string;
  date: Date;
}

export interface Transaction {
  id: string;
  userId: string;
  amount: number;
  type: 'credit' | 'debit'; // credit = add money/refund, debit = payment
  description: string;
  date: Date;
}
