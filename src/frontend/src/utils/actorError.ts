/**
 * Utility to extract user-facing error messages from IC agent errors/rejections/traps
 * while preserving the original error for console logging.
 */

export interface ExtractedError {
  userMessage: string;
  originalError: unknown;
}

/**
 * Extract a user-facing error message from various IC agent error types
 */
export function extractActorError(error: unknown): ExtractedError {
  const originalError = error;

  // Handle Error objects
  if (error instanceof Error) {
    const message = error.message;

    // Check for common IC agent error patterns
    if (message.includes("Unauthorized")) {
      return {
        userMessage:
          "Unauthorized: You do not have permission to perform this action.",
        originalError,
      };
    }

    if (message.includes("trap")) {
      // Extract the trap message if available
      const trapMatch = message.match(/trap[:\s]+(.+?)(?:\n|$)/i);
      if (trapMatch?.[1]) {
        return {
          userMessage: trapMatch[1].trim(),
          originalError,
        };
      }
      return {
        userMessage: message,
        originalError,
      };
    }

    if (message.includes("Call was rejected")) {
      return {
        userMessage:
          "The backend rejected this request. Please check your inputs and try again.",
        originalError,
      };
    }

    if (message.includes("not available") || message.includes("connection")) {
      return {
        userMessage:
          "Backend connection not available. Please check your connection and try again.",
        originalError,
      };
    }

    // Return the error message as-is if it's already user-friendly
    return {
      userMessage: message,
      originalError,
    };
  }

  // Handle string errors
  if (typeof error === "string") {
    return {
      userMessage: error,
      originalError,
    };
  }

  // Handle objects with message property
  if (error && typeof error === "object" && "message" in error) {
    return extractActorError((error as { message: unknown }).message);
  }

  // Fallback for unknown error types
  return {
    userMessage: "An unexpected error occurred. Please try again.",
    originalError,
  };
}
