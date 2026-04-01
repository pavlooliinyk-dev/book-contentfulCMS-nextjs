import React from 'react';

interface StarRatingDisplayProps {
  rating: number | null;
  maxStars?: number;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
}

/**
 * StarRatingDisplay Component
 * 
 * Displays a star rating from Contentful's star-rating field extension
 * Use this on PLP (Product List Page) and PDP (Product Detail Page)
 * 
 * CONTENTFUL BEST PRACTICE:
 * - Uses defensive type checking for CMS data (rating may be null/undefined)
 * - Validates rating is a number before rendering
 * - Handles edge cases from draft/preview mode
 * 
 * @example
 * // On Book List/Grid
 * <StarRatingDisplay rating={book.fields?.rating} size="sm" />
 * 
 * // On Book Detail Page  
 * <StarRatingDisplay rating={book.fields?.rating} size="lg" showLabel />
 */
export function StarRatingDisplay({ 
  rating, 
  maxStars = 5, 
  size = 'md',
  showLabel = false,
  className = ''
}: StarRatingDisplayProps) {
  // Defensive check: Contentful fields can be null, undefined, or unexpected types
  if (!rating || typeof rating !== 'number' || rating < 1 || rating > maxStars) {
    return null;
  }

  const sizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-xl'
  };

  const starSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      <div className="flex gap-0.5">
        {Array.from({ length: maxStars }).map((_, index) => (
          <svg
            key={index}
            className={`${starSizes[size]} ${
              index < rating ? 'text-yellow-500' : 'text-gray-300'
            }`}
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
        ))}
      </div>
      {showLabel && (
        <span className={`${sizeClasses[size]} text-gray-600 font-medium ml-1`}>
          {rating}/{maxStars}
        </span>
      )}
    </div>
  );
}

/**
 * Usage Example in Book Grid Component
 * 
 * CONTENTFUL BEST PRACTICE: Use optional chaining (?.) for CMS fields
 */
export function BookCardExample() {
  // This would come from your Contentful API
  const book = {
    fields: {
      title: 'Sample Book',
      rating: 4, // From star-rating field (can be null)
    }
  };

  return (
    <div className="book-card">
      <h3>{book.fields?.title}</h3>
      {/* Use optional chaining - rating may not exist in draft mode */}
      <StarRatingDisplay rating={book.fields?.rating} size="sm" />
    </div>
  );
}

/**
 * Usage Example in Book Detail Component
 * 
 * CONTENTFUL BEST PRACTICE: Use optional chaining (?.) for CMS fields
 */
export function BookDetailExample() {
  // This would come from your Contentful API
  const book = {
    fields: {
      title: 'Sample Book',
      rating: 5, // From star-rating field (can be null)
    }
  };

  return (
    <div className="book-detail">
      <h1>{book.fields?.title}</h1>
      {/* Use optional chaining - rating may not exist in draft mode */}
      <StarRatingDisplay 
        rating={book.fields?.rating} 
        size="lg" 
        showLabel 
        className="my-4"
      />
    </div>
  );
}
