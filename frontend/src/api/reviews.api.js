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
