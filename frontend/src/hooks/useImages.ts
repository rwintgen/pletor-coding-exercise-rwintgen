import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { deleteImage, getUserImages, ListImagesParams, listImages, uploadImage } from '../api/client'

/** Fetches all images with optional search/filter/sort. */
export function useImages(params?: ListImagesParams) {
  return useQuery({
    queryKey: ['images', params],
    queryFn: () => listImages(params),
  })
}

/** Fetches images for a specific user's profile. */
export function useUserImages(username: string) {
  return useQuery({
    queryKey: ['userImages', username],
    queryFn: () => getUserImages(username),
    enabled: !!username,
  })
}

/** Mutation hook for uploading; invalidates images and quota on success. */
export function useUploadImage() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (form: FormData) => uploadImage(form),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['images'] })
      qc.invalidateQueries({ queryKey: ['quota'] })
    },
  })
}

/** Mutation hook for deleting; invalidates images and quota on success. */
export function useDeleteImage() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => deleteImage(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['images'] })
      qc.invalidateQueries({ queryKey: ['quota'] })
    },
  })
}
