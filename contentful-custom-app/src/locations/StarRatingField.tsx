import { useEffect, useState, useCallback } from 'react';
import { FieldExtensionSDK } from '@contentful/app-sdk';
import { Box } from '@contentful/f36-components';
import { DEFAULT_RATING_COLOR, DEFAULT_RATING_MAX_STARS } from '../constants';

interface StarRatingFieldProps {
  sdk: FieldExtensionSDK;
}



export const StarRatingField = ({ sdk }: StarRatingFieldProps) => {
  const currentValue = sdk.field.getValue();
  const [rating, setRating] = useState<number | null>(
    typeof currentValue === 'number' ? currentValue : null
  );
  const [hoveredStar, setHoveredStar] = useState<number | null>(null);
  const [isDisabled, setIsDisabled] = useState(false);

  // Get parameters from app configuration
  const appParams = sdk.parameters.installation as {
    maxStars?: number;
    starColor?: string;
  } || {};
  const maxStars = appParams.maxStars || DEFAULT_RATING_MAX_STARS;
  const starColor = appParams.starColor || DEFAULT_RATING_COLOR;

  useEffect(() => {
    // Auto-resize to content height
    sdk.window.startAutoResizer();

    // Check if field is disabled (read-only mode for published entries)
    const checkDisabled = () => {
      const isReadOnly = sdk.field.locale && sdk.entry.getSys().publishedVersion;
      setIsDisabled(!!isReadOnly);
    };

    checkDisabled();

    // Listen for external value changes
    const detachValueChangeHandler = sdk.field.onValueChanged((newValue: number | null) => {
      setRating(typeof newValue === 'number' ? newValue : null);
    });

    // Listen for disabled state changes
    const detachIsDisabledHandler = sdk.field.onIsDisabledChanged((disabled: boolean) => {
      setIsDisabled(disabled);
    });

    return () => {
      detachValueChangeHandler();
      detachIsDisabledHandler();
      sdk.window.stopAutoResizer();
    };
  }, [sdk]);

  const handleStarClick = useCallback(
    (starValue: number) => {
      if (isDisabled) return;

      const newRating = rating === starValue ? null : starValue;
      setRating(newRating);
      sdk.field.setValue(newRating);
    },
    [rating, isDisabled, sdk]
  );

  const handleStarHover = useCallback(
    (starValue: number | null) => {
      if (!isDisabled) {
        setHoveredStar(starValue);
      }
    },
    [isDisabled]
  );

  const getStarFill = (starIndex: number): string => {
    const displayValue = hoveredStar !== null ? hoveredStar : rating;
    if (displayValue && starIndex <= displayValue) {
      return starColor;
    }
    return '#e0e0e0'; // Gray for empty stars
  };

  const stars = Array.from({ length: maxStars }, (_, i) => i + 1);

  return (
      <Box
        style={{
          display: 'flex',
          gap: '8px',
          padding: '8px 0',
          cursor: isDisabled ? 'not-allowed' : 'pointer',
          opacity: isDisabled ? 0.6 : 1,
          marginBottom: '16px',
        }}
        onMouseLeave={() => handleStarHover(null)}
      >
        {stars.map((starIndex) => (
          <svg
            key={starIndex}
            width="32"
            height="32"
            viewBox="0 0 24 24"
            fill={getStarFill(starIndex)}
            stroke={starColor}
            strokeWidth="1"
            style={{
              cursor: isDisabled ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s ease',
              transform: hoveredStar === starIndex ? 'scale(1.1)' : 'scale(1)',
            }}
            onClick={() => handleStarClick(starIndex)}
            onMouseEnter={() => handleStarHover(starIndex)}
          >
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
        ))}
        {rating !== null && (
          <span
            style={{
              marginLeft: '8px',
              alignSelf: 'center',
              fontSize: '14px',
              color: '#666',
              fontWeight: 500,
            }}
          >
            {rating} / {maxStars}
          </span>
        )}
      </Box>
  );
};
