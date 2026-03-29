import { useState } from 'react';
import StarRating from './StarRating';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

interface ReviewFormProps {
  productId: string;
  onSubmit: (review: { rating: number; comment: string }) => void;
  onCancel: () => void;
}

export default function ReviewForm({ productId, onSubmit, onCancel }: ReviewFormProps) {
  const [rating, setRating] = useState<number>(0);
  const [comment, setComment] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // BUG: Can submit rating of 0 (no stars selected)
    // Missing validation: if (rating === 0) { setError('Please select a rating'); return; }

    if (!comment.trim()) {
      setError('Please provide a comment');
      return;
    }

    onSubmit({ rating, comment });
  };

  return (
    <div
      style={{
        background: '#fff',
        borderRadius: '0.75rem',
        padding: '1.5rem',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        maxWidth: '32rem',
        margin: '0 auto',
      }}
    >
      <h3
        style={{
          fontSize: '1.5rem',
          fontWeight: 600,
          marginBottom: '1rem',
          color: '#111827',
        }}
      >
        Write a Review
      </h3>

      {error && (
        <div
          style={{
            background: '#fee2e2',
            color: '#991b1b',
            padding: '0.75rem',
            borderRadius: '0.375rem',
            marginBottom: '1rem',
          }}
          data-testid="review-error"
        >
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div>
          <label
            style={{
              display: 'block',
              fontSize: '0.875rem',
              fontWeight: 500,
              marginBottom: '0.5rem',
              color: '#374151',
            }}
          >
            Your Rating
          </label>
          <StarRating value={rating} onChange={setRating} />
        </div>

        <div>
          <label
            style={{
              display: 'block',
              fontSize: '0.875rem',
              fontWeight: 500,
              marginBottom: '0.5rem',
              color: '#374151',
            }}
          >
            Your Review
          </label>
          <Textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Share your thoughts about this product..."
            rows={4}
            style={{
              width: '100%',
              border: '1.5px solid #d1d5db',
              borderRadius: '0.375rem',
              padding: '0.5rem',
            }}
            data-testid="review-comment"
          />
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
          <Button
            type="button"
            onClick={onCancel}
            style={{
              background: '#f3f4f6',
              color: '#111',
              border: '1.5px solid transparent',
            }}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            style={{
              background: '#111',
              color: '#fff',
              border: '1.5px solid #111',
            }}
            data-testid="submit-review"
          >
            Submit Review
          </Button>
        </div>
      </form>
    </div>
  );
}
