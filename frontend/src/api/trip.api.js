import axiosClient, { unwrap } from "./axiosClient";

const normalizeTrip = (trip) => ({
  ...trip,
  places: (trip?.places ?? []).filter(Boolean),
});

// GET /api/v1/trip/ (authenticated)
export const getMyTrip = async ({ signal } = {}) => {
  const response = await axiosClient.get("/trip", { signal });
  return normalizeTrip(unwrap(response));
};

// POST /api/v1/trip/places/:placeId (authenticated)
export const addPlaceToTrip = async (placeId) => {
  const response = await axiosClient.post(
    `/trip/places/${encodeURIComponent(placeId)}`,
  );
  return normalizeTrip(unwrap(response));
};

// DELETE /api/v1/trip/places/:placeId (authenticated)
export const removePlaceFromTrip = async (placeId) => {
  const response = await axiosClient.delete(
    `/trip/places/${encodeURIComponent(placeId)}`,
  );
  return normalizeTrip(unwrap(response));
};

// DELETE /api/v1/trip/ (authenticated)
export const clearMyTrip = async () => {
  const response = await axiosClient.delete("/trip");
  return normalizeTrip(unwrap(response));
};
