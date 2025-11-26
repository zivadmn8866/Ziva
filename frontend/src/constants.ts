
import { User, Role, Service, Booking, Offer, Query, Review, Transaction } from './types';
import { HaircutIcon, ShaveIcon, FacialIcon, MassageIcon, ManicureIcon } from './components/icons';

export const MOCK_USERS: User[] = [
  { id: 'user-1', name: 'Alice', mobile: '1112223330', role: Role.CUSTOMER, password: 'password123', hasOnboarded: false, walletBalance: 1500, loyaltyPoints: 250, tier: 'Silver' },
  { id: 'user-2', name: 'Bob Barber', mobile: '4445556660', role: Role.PROVIDER, shopName: "Bob's Classic Cuts", shopAddress: "123 Style Street, San Francisco", password: 'password123', email: 'bob@example.com', latitude: 37.7749, longitude: -122.4194, isVerified: true, walletBalance: 5000 },
  { id: 'user-3', name: 'Ziva Admin', mobile: '9876543210', role: Role.ADMIN, password: 'admin123', email: 'zivadmn@gmail.com' },
  { id: 'user-4', name: 'Carol Stylist', mobile: '7778889990', role: Role.PROVIDER, shopName: "Style House", shopAddress: "456 Fashion Ave, Oakland", password: 'password123', email: 'carol@example.com', latitude: 37.8044, longitude: -122.2711, isVerified: false, walletBalance: 0 },
];

export const MOCK_SERVICES: Service[] = [
  { id: 'service-1', name: 'Men\'s Haircut', description: 'Classic men\'s haircut and style.', price: 150, duration: 30, category: 'Hair', providerId: 'user-2', icon: HaircutIcon, isInstant: true },
  { id: 'service-2', name: 'Beard Trim', description: 'Shape and trim your beard to perfection.', price: 80, duration: 20, category: 'Beard', providerId: 'user-2', icon: ShaveIcon },
  { id: 'service-3', name: 'Cleansing Facial', description: 'A refreshing facial to cleanse and rejuvenate your skin.', price: 500, duration: 45, category: 'Skincare', providerId: 'user-2', icon: FacialIcon, isHomeService: true, homeServiceFee: 150 },
  { id: 'service-4', name: 'Head Massage', description: 'Relaxing head massage with essential oils.', price: 250, duration: 25, category: 'Relaxation', providerId: 'user-2', icon: MassageIcon, isHomeService: true, homeServiceFee: 100 },
  { id: 'service-5', name: 'Manicure', description: 'Nail shaping, cuticle care, and a polish.', price: 300, duration: 30, category: 'Nails', providerId: 'user-2', icon: ManicureIcon },
  // Services for Carol
  { id: 'service-6', name: 'Women\'s Haircut', description: 'Modern women\'s haircut and styling.', price: 250, duration: 45, category: 'Hair', providerId: 'user-4', icon: HaircutIcon, isInstant: true, isHomeService: true, homeServiceFee: 200 },
  { id: 'service-7', name: 'Hair Coloring', description: 'Professional hair coloring services.', price: 800, duration: 90, category: 'Hair', providerId: 'user-4', icon: HaircutIcon },
  { id: 'service-8', name: 'Pedicure', description: 'Relaxing pedicure with foot massage.', price: 400, duration: 40, category: 'Nails', providerId: 'user-4', icon: ManicureIcon, isHomeService: true, homeServiceFee: 150 },
];

export const MOCK_BOOKINGS: Booking[] = [
  {
    id: 'booking-1',
    serviceIds: ['service-1', 'service-2', 'service-4'],
    customerId: 'user-1',
    providerId: 'user-2',
    dateTime: new Date(new Date().getTime() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
    totalAmount: 630,
    platformFee: 0,
    status: 'upcoming',
    peopleCount: 2,
    rescheduled: false,
    groupDetails: [
        { name: 'Person 1', serviceIds: ['service-1', 'service-2'] }, // Haircut + trim
        { name: 'Person 2', serviceIds: ['service-1', 'service-4'] }  // Haircut + massage
    ]
  },
  {
    id: 'booking-2',
    serviceIds: ['service-3'],
    customerId: 'user-1',
    providerId: 'user-2',
    dateTime: new Date(new Date().getTime() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
    totalAmount: 500,
    platformFee: 0,
    status: 'completed',
    peopleCount: 1,
    isHomeService: false,
    reviewId: 'review-1'
  },
];

export const MOCK_OFFERS: Offer[] = [
  {
    id: 'offer-1',
    providerId: 'user-2',
    title: 'Weekday Combo',
    description: 'Get 15% off on Haircut + Beard Trim combo on weekdays.',
    discountPercentage: 15,
    serviceIds: ['service-1', 'service-2'],
  },
   {
    id: 'offer-2',
    providerId: 'user-4',
    title: 'Color Special',
    description: '10% off on hair coloring services.',
    discountPercentage: 10,
    serviceIds: ['service-7'],
  },
];

export const MOCK_QUERIES: Query[] = [
  {
    id: 'query-1',
    userId: 'user-1',
    userName: 'Alice',
    subject: 'Question about facial service',
    message: 'Are the products used in the facial organic?',
    createdAt: new Date(),
  },
];

export const MOCK_REVIEWS: Review[] = [
  {
    id: 'review-1',
    bookingId: 'booking-2',
    customerId: 'user-1',
    providerId: 'user-2',
    rating: 5,
    comment: "Excellent service! Highly recommended.",
    date: new Date(new Date().getTime() - 4 * 24 * 60 * 60 * 1000)
  }
];

export const MOCK_TRANSACTIONS: Transaction[] = [
  { id: 'tx-1', userId: 'user-1', amount: 500, type: 'debit', description: 'Payment for Facial', date: new Date(new Date().getTime() - 5 * 24 * 60 * 60 * 1000) },
  { id: 'tx-2', userId: 'user-1', amount: 2000, type: 'credit', description: 'Added via UPI', date: new Date(new Date().getTime() - 10 * 24 * 60 * 60 * 1000) },
  { id: 'tx-3', userId: 'user-2', amount: 450, type: 'credit', description: 'Payout for Booking #booking-2', date: new Date(new Date().getTime() - 4 * 24 * 60 * 60 * 1000) },
];
