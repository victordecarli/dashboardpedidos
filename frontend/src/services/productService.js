import { api } from "./api";

export const getProducts = async () => {
  return api.get("/products");
};

export const createProduct = async (productData) => {
  return api.post("/products", productData);
};
