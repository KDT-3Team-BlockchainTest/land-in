import { api } from './client';

export const uploadsApi = {
  image: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.postForm('/admin/uploads/images', formData);
  },
};
