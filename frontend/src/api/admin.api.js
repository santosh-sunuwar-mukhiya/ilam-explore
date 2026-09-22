import axiosClient, { unwrap } from "./axiosClient";

const toListResult = (response, key) => {
  const data = unwrap(response) || {};
  return {
    items: data[key] ?? [],
    total: data.total ?? data[key]?.length ?? 0,
  };
};

export const getDashboardStats = async () => {
  const response = await axiosClient.get("/admin/dashboard");
  return unwrap(response);
};

export const listUsers = async () => {
  const response = await axiosClient.get("/users");
  return toListResult(response, "users");
};

export const listActiveUsers = async () => {
  const response = await axiosClient.get("/users/active-users");
  return toListResult(response, "users");
};

export const suspendUser = async (id) => {
  const response = await axiosClient.patch(
    `/users/${encodeURIComponent(id)}/suspend`,
  );
  return unwrap(response);
};

export const unsuspendUser = async (id) => {
  const response = await axiosClient.patch(
    `/users/${encodeURIComponent(id)}/unsuspend`,
  );
  return unwrap(response);
};

export const deleteUser = async (id) => {
  const response = await axiosClient.delete(`/users/${encodeURIComponent(id)}`);
  return unwrap(response);
};

export const listAllReviews = async ({ place } = {}) => {
  const response = await axiosClient.get("/reviews", {
    params: place ? { place } : {},
  });
  return toListResult(response, "reviews");
};

const buildPlaceFormData = (place) => {
  const formData = new FormData();
  const fields = [
    "name",
    "slug",
    "description",
    "location",
    "category",
    "bestTimeToVisit",
    "entryFee",
    "thingsToDo",
    "images",
  ];

  fields.forEach((field) => {
    if (place[field] !== undefined) formData.append(field, place[field]);
  });

  (place.imageFiles || []).forEach((file) => formData.append("images", file));

  return formData;
};

export const createPlace = async (place) => {
  const response = await axiosClient.post(
    "/places",
    buildPlaceFormData(place),
    { headers: { "Content-Type": "multipart/form-data" } },
  );
  return unwrap(response);
};

export const updatePlace = async (id, place) => {
  const response = await axiosClient.patch(
    `/places/${encodeURIComponent(id)}`,
    buildPlaceFormData(place),
    { headers: { "Content-Type": "multipart/form-data" } },
  );
  return unwrap(response);
};

export const deletePlace = async (id) => {
  const response = await axiosClient.delete(
    `/places/${encodeURIComponent(id)}`,
  );
  return unwrap(response);
};
