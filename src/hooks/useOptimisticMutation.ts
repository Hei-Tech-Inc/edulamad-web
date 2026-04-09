import { useMutation, type UseMutationResult } from '@tanstack/react-query'

type OptimisticOptions<TData, TVariables> = {
  mutationFn: (variables: TVariables) => Promise<TData>
  onMutate: (variables: TVariables) => void
  onSuccess?: (data: TData, variables: TVariables) => void
  onError: (error: Error, variables: TVariables) => void
  onSettled?: () => void
}

export function useOptimisticMutation<TData, TVariables>(
  options: OptimisticOptions<TData, TVariables>,
): { mutate: (variables: TVariables) => void; isLoading: boolean } {
  const mutation: UseMutationResult<TData, Error, TVariables> = useMutation({
    mutationFn: options.mutationFn,
    onSuccess: (data, variables) => {
      options.onSuccess?.(data, variables)
    },
    onError: (error, variables) => {
      options.onError(error, variables)
    },
    onSettled: () => {
      options.onSettled?.()
    },
  })

  const mutate = (variables: TVariables) => {
    options.onMutate(variables)
    mutation.mutate(variables)
  }

  return { mutate, isLoading: mutation.isPending }
}
