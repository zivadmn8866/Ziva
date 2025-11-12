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