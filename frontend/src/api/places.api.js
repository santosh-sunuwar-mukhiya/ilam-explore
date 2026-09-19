import axiosClient, { unwrap } from "./axiosClient";

// GET /api/v1/places  (public)
// Supported filters: ?category=Tea%20Garden and ?search=kanyam
export const listPlaces = async ({ category, search, signal } = {}) => {
  const params = {};

  if (category) params.category = category;
  if (search) params.search = search;

  const response = await axiosClient.get("/places", { params, signal });
  const data = unwrap(response) || {};

  return {
    places: data.places ?? [],
    total: data.total ?? (data.places?.length ?? 0),
  };
};

// GET /api/v1/places/:id  (public)
export const getPlaceById = async (id, { signal } = {}) => {
  const response = await axiosClient.get(`/places/${encodeURIComponent(id)}`, {
    signal,
  });

  return unwrap(response);
};
