// Application configuration

// DEFAULT_USER_ID is used when simulating actions like adding comments or updating status.
// In a real app, this would come from the authenticated user's session.
// For the GR1 demo, we use an existing UUID from the seeded database data.
// If actions fail with "User not found", update this ID to match a valid user in the users table.
export const DEFAULT_USER_ID = '1efd8876-008f-4f88-bbf4-6baa70a0709b'; // Alice Tester from seed data

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api/v1';
