"use client";

import { useState } from "react";
import { FaStar, FaRegStar } from "react-icons/fa";
import { toast } from "sonner";
import { apiClient } from "@/lib/api-client";
import { Review } from "@/lib/api/product-api";

interface ProductReviewsProps {
  productId: string;
  reviews: Review[];
  onReviewAdded: () => void;
}

export default function ProductReviews({
  productId,
  reviews,
  onReviewAdded,
}: ProductReviewsProps) {
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [comment, setComment] = useState<string>("");
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [showForm, setShowForm] = useState<boolean>(false);

  // If there are no reviews and the user hasn't opened the submission form, display nothing
  if (reviews.length === 0 && !showForm) {
    return (
      <div className="flex justify-center pt-4">
        <button
          onClick={() => setShowForm(true)}
          className="text-xs font-bold uppercase tracking-wider text-[#C4956A] hover:underline cursor-pointer"
        >
          + Write the first review for this product
        </button>
      </div>
    );
  }

  const averageRating =
    reviews.length > 0
      ? (
          reviews.reduce((acc, curr) => acc + curr.rating, 0) / reviews.length
        ).toFixed(1)
      : "0";

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!comment.trim()) {
      toast.error("Please enter a comment for your review.");
      return;
    }

    try {
      setSubmitting(true);
      await apiClient.createReview({
        productId,
        rating,
        comment: comment.trim(),
      });
      toast.success("Review submitted successfully!");
      setComment("");
      setRating(5);
      setShowForm(false);
      onReviewAdded();
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : "Failed to submit review. Please ensure you are logged in.";
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 font-sans text-[#151413]">
      {/* Review Summary Header */}
      {reviews.length > 0 && (
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-[#EAE8E4]">
          <div className="flex items-center gap-3">
            <span className="font-heading text-3xl font-extrabold text-[#151413]">
              {averageRating}
            </span>
            <div className="flex flex-col">
              <div className="flex items-center text-amber-500 gap-0.5">
                {[1, 2, 3, 4, 5].map((star) =>
                  star <= Math.round(Number(averageRating)) ? (
                    <FaStar key={star} className="w-4 h-4" />
                  ) : (
                    <FaRegStar key={star} className="w-4 h-4 text-[#EAE8E4]" />
                  ),
                )}
              </div>
              <span className="text-xs text-[#76726E] mt-0.5">
                Based on {reviews.length}{" "}
                {reviews.length === 1 ? "review" : "reviews"}
              </span>
            </div>
          </div>

          <button
            onClick={() => setShowForm((prev) => !prev)}
            className="px-4 py-2 bg-[#151413] text-white text-xs font-bold uppercase tracking-wider rounded-md hover:bg-[#2A2725] transition-colors cursor-pointer"
          >
            {showForm ? "Cancel Review" : "Write A Review"}
          </button>
        </div>
      )}

      {/* Write Review Form */}
      {showForm && (
        <form
          onSubmit={handleSubmitReview}
          className="bg-[#FAF9F6] border border-[#EAE8E4] rounded-md p-5 flex flex-col gap-4"
        >
          <h4 className="font-heading text-xs font-bold uppercase tracking-wider text-[#151413]">
            Submit Your Review
          </h4>

          {/* Star Selection */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-[#76726E]">Your Rating:</span>
            <div className="flex items-center gap-1 cursor-pointer">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  type="button"
                  key={star}
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="p-0.5 text-amber-500 focus:outline-hidden"
                >
                  {star <= (hoverRating || rating) ? (
                    <FaStar className="w-4 h-4" />
                  ) : (
                    <FaRegStar className="w-4 h-4 text-[#A39E98]" />
                  )}
                </button>
              ))}
            </div>
          </div>

          <textarea
            rows={3}
            required
            placeholder="Share details of your experience with this product..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="w-full p-3 bg-white border border-[#EAE8E4] rounded-md text-xs text-[#151413] focus:outline-hidden focus:border-[#C4956A]"
          />

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-4 py-2 border border-[#EAE8E4] text-xs font-bold uppercase tracking-wider rounded-md cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 bg-[#151413] text-white text-xs font-bold uppercase tracking-widest rounded-md hover:bg-[#2A2725] transition-colors cursor-pointer disabled:bg-[#A39E98]"
            >
              {submitting ? "Submitting..." : "Post Review"}
            </button>
          </div>
        </form>
      )}

      {/* Existing Reviews List */}
      {reviews.length > 0 && (
        <div className="flex flex-col gap-4">
          {reviews.map((rev) => (
            <div
              key={rev.id}
              className="border-b border-[#EAE8E4] pb-4 flex flex-col gap-2"
            >
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-xs text-[#151413]">
                    {rev.user?.firstName
                      ? `${rev.user.firstName} ${rev.user.lastName || ""}`
                      : "Verified Buyer"}
                  </span>
                  <div className="flex items-center text-amber-500 gap-0.5">
                    {[1, 2, 3, 4, 5].map((star) =>
                      star <= rev.rating ? (
                        <FaStar key={star} className="w-3 h-3" />
                      ) : (
                        <FaRegStar
                          key={star}
                          className="w-3 h-3 text-[#EAE8E4]"
                        />
                      ),
                    )}
                  </div>
                </div>
                <span className="text-[10px] text-[#76726E]">
                  {new Date(rev.createdAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </span>
              </div>
              <p className="text-xs text-[#76726E] leading-relaxed">
                {rev.comment}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
