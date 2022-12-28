import type { QueryClient } from '@tanstack/query-core'
import type { Context, JSX } from 'solid-js'
import {
  createContext,
  useContext,
  onMount,
  onCleanup,
  mergeProps,
} from 'solid-js'
import type { ContextOptions } from './types'

declare global {
  interface Window {
    SolidQueryClientContext?: Context<QueryClient | undefined>
  }
}

export const defaultContext = createContext<QueryClient | undefined>(undefined)
const QueryClientSharingContext = createContext<boolean>(false)

// If we are given a context, we will use it.
function getQueryClientContext(
  context: Context<QueryClient | undefined> | undefined,
) {
  if (context) {
    return context
  }

  return defaultContext
}

export const useQueryClient = ({ context }: ContextOptions = {}) => {
  const queryClient = useContext(getQueryClientContext(context))

  if (!queryClient) {
    throw new Error('No QueryClient set, use QueryClientProvider to set one')
  }

  return queryClient
}

type QueryClientProviderPropsBase = {
  client: QueryClient
  children?: JSX.Element
}
type QueryClientProviderPropsWithContext = ContextOptions &
  QueryClientProviderPropsBase

export type QueryClientProviderProps = QueryClientProviderPropsWithContext

export const QueryClientProvider = (
  props: QueryClientProviderProps,
): JSX.Element => {
  const mergedProps = mergeProps(props)
  onMount(() => {
    mergedProps.client.mount()
  })
  onCleanup(() => mergedProps.client.unmount())

  const QueryClientContext = getQueryClientContext(mergedProps.context)

  return (
    <QueryClientSharingContext.Provider value={!mergedProps.context}>
      <QueryClientContext.Provider value={mergedProps.client}>
        {mergedProps.children}
      </QueryClientContext.Provider>
    </QueryClientSharingContext.Provider>
  )
}
