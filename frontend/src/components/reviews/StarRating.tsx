import { useState } from 'react';

interface StarRatingProps {
  value: number;
  onChange: (rating: number) => void;
  maxStars?: number;
}

export default function StarRating({ value, onChange, maxStars = 5 }: StarRatingProps) {
  const [hoverRating, setHoverRating] = useState<number | null>(null);

  const handleStarClick = (rating: number) => {
    onChange(rating);
    // BUG: Rating number doesn't update when stars clicked
    // The value is passed to onChange but the component doesn't force a re-render
  };

  const handleMouseEnter = (rating: number) => {
    setHoverRating(rating);
  };

  const handleMouseLeave = () => {
    // BUG: Hover preview doesn't reset when mouse leaves (stuck in preview state)
    // setHoverRating(null); is commented out
    // This causes the hover state to persist after mouse leaves
  };

  const displayRating = hoverRating !== null ? hoverRating : value;

  return (
    <div className="star-rating-container" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
      <div className="stars" style={{ display: 'flex', gap: '0.25rem' }}>
        {Array.from({ length: maxStars }, (_, index) => {
          const starValue = index + 1;
          const isFilled = starValue <= displayRating;

          return (
            <button
              key={starValue}
              type="button"
              onClick={() => handleStarClick(starValue)}
              onMouseEnter={() => handleMouseEnter(starValue)}
              onMouseLeave={handleMouseLeave}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontSize: '2rem',
                padding: '0',
                transition: 'transform 0.2s',
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = 'scale(1.2)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
              }}
              aria-label={`Rate ${starValue} stars`}
              data-testid={`star-${starValue}`}
            >
              <span style={{ color: isFilled ? '#fbbf24' : '#d1d5db' }}>★</span>
            </button>
          );
        })}
      </div>
      <div
        className="rating-text"
        style={{ fontSize: '0.875rem', color: '#6b7280' }}
        data-testid="rating-display"
      >
        {/* BUG: This displays the hover rating, not the actual selected rating */}
        {displayRating > 0 ? `${displayRating} out of ${maxStars} stars` : 'No rating selected'}
      </div>
    </div>
  );
}
