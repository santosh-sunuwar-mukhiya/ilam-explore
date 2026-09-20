import axiosClient, { unwrap } from "./axiosClient";

// GET /api/v1/reviews/place/:placeId  (public)
// Each review has its user populated with { name, avatar }.
export const listPlaceReviews = async (placeId, { signal } = {}) => {
  const response = await axiosClient.get(
    `/reviews/place/${encodeURIComponent(placeId)}`,
    { signal },
  );
  const data = unwrap(response) || {};

  return {
    reviews: data.reviews ?? [],
    total: data.total ?? (data.reviews?.length ?? 0),
  };
};

// POST /api/v1/reviews (authenticated)
export const createReview = async ({ place, rating, comment }) => {
  const response = await axiosClient.post("/reviews", {
    place,
    rating,
    comment,
  });

  return unwrap(response);
};

// PATCH /api/v1/reviews/:id (authenticated owner/admin)
export const updateReview = async (id, { rating, comment }) => {
  const response = await axiosClient.patch(`/reviews/${encodeURIComponent(id)}`, {
    rating,
    comment,
  });

  return unwrap(response);
};

// DELETE /api/v1/reviews/:id (authenticated owner/admin)
export const deleteReview = async (id) => {
  const response = await axiosClient.delete(`/reviews/${encodeURIComponent(id)}`);
  return unwrap(response);
};
