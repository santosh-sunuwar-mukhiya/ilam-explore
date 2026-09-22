import axiosClient, { unwrap } from "./axiosClient";

// PATCH /api/v1/users/profile -> the updated authenticated user
export const updateProfile = async ({ name, avatar }) => {
  const formData = new FormData();

  if (name !== undefined) formData.append("name", name);
  if (avatar) formData.append("avatar", avatar);

  const response = await axiosClient.patch("/users/profile", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  return unwrap(response);
};
