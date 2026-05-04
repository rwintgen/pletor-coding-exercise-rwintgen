import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { deleteImage, listImages, uploadImage } from '../api/client'

/** Fetches all images. Cached and refetched on mutations. */
export function useImages() {
  return useQuery({
    queryKey: ['images'],
    queryFn: listImages,
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
