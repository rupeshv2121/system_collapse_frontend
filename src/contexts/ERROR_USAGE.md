/**
 * Error Navigation Utility
 * 
 * Import and use this in any component to programmatically trigger error pages:
 * 
 * import { useError } from '@/contexts/ErrorContext';
 * 
 * const { showNetworkError, showServerError } = useError();
 * 
 * // When network error occurs:
 * showNetworkError();
 * 
 * // When backend server is down:
 * showServerError();
 * 
 * The ErrorContext will automatically handle navigation to:
 * - /error/network - for internet connection issues
 * - /error/server - for backend server unavailability
 * 
 * Both error pages include:
 * - Detailed error description
 * - Troubleshooting steps
 * - Retry functionality
 * - Auto-detection of connection restoration
 */

export {};
