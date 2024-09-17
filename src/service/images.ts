import { Axios } from "axios";
import { API_CONFIG, ENDPOINTS } from "../constants/api";
import { ImageI } from "../models/image";

const AxiosInstance = new Axios({
  baseURL: API_CONFIG.API_DOMAIN,
});

export async function getImages(
  page: number,
  pageSize: number
): Promise<ImageI[]> {
  const res = await AxiosInstance.get(
    `${ENDPOINTS.GET_IMAGES}?page=${page}&pageSize=${pageSize}`
  );

  return JSON.parse(res.data);
}

export async function likeImage(imageId: string): Promise<ImageI[]> {
  const res = await AxiosInstance.post(
    `${ENDPOINTS.GET_IMAGES}/${imageId}/likes`
  );

  return res.data;
}
