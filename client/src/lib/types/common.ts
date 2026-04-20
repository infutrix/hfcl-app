export type ApiErrorResponse = {
  error?: string
  message: string | string[]
  statusCode?: number
}

export type PaginatedResponse<T = unknown> = [
  T[],
  {
    currentPage: number
    pageCount: number
    totalCount: number
    isFirstPage: boolean
    isLastPage: boolean
    nextPage: number | null
    previousPage: number | null
  },
]

export const UserRoles = ["ADMIN", "USER"] as const
export type UserRoles = (typeof UserRoles)[number]
export type EnitityStatus = "ACTIVE" | "INACTIVE"
