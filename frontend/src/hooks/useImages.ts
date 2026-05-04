import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { deleteImage, getUserImages, ListImagesParams, listImages, PAGE_SIZE, renameImage, uploadImage } from '../api/client'

/** Fetches images with infinite scroll (load more) pagination. */
export function useImages(params?: ListImagesParams) {
  return useInfiniteQuery({
    queryKey: ['images', params],
    queryFn: ({ pageParam = 0 }) => listImages(params, pageParam),
    initialPageParam: 0,
    getNextPageParam: (lastPage, _allPages, lastPageParam) =>
      lastPage.length === PAGE_SIZE ? lastPageParam + PAGE_SIZE : undefined,
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
      qc.invalidateQueries({ queryKey: ['userImages'] })
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
      qc.invalidateQueries({ queryKey: ['userImages'] })
      qc.invalidateQueries({ queryKey: ['quota'] })
    },
  })
}

/** Mutation hook for renaming; invalidates images on success. */
export function useRenameImage() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, title }: { id: number; title: string }) => renameImage(id, title),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['images'] })
      qc.invalidateQueries({ queryKey: ['userImages'] })
    },
  })
}
