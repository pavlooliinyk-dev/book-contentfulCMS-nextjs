import React from 'react';
import { DEFAULT_RATING_COLOR, DEFAULT_RATING_MAX_STARS } from '@/lib/constants';

interface StarRatingDisplayProps {
  rating: number | null;
  maxStars?: number;
  color?: string;
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
 * - Expects scalar rating value from CMS
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
  maxStars = DEFAULT_RATING_MAX_STARS,
  color = DEFAULT_RATING_COLOR,
  size = 'md',
  showLabel = false,
  className = ''
}: StarRatingDisplayProps) {
  if (!rating) {
    return null;
  }

  const ratingValue = rating;

  // Defensive check: rating must be a valid number
  if (
    ratingValue === null ||
    typeof ratingValue !== 'number' ||
    ratingValue < 1 ||
    ratingValue > maxStars
  ) {
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
              index < ratingValue ? '' : 'text-gray-300'
            }`}
            fill="currentColor"
            style={{
              color: index < ratingValue ? color : '#d1d5db',
            }}
            viewBox="0 0 24 24"
          >
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
        ))}
      </div>
      {showLabel && (
        <span className={`${sizeClasses[size]} text-gray-600 font-medium ml-1`}>
          {ratingValue}/{maxStars}
        </span>
      )}
    </div>
  );
}

