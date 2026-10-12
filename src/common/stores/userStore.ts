import { createStore } from 'zustand/vanilla'

export interface User {
  id: string
  email: string
  name: string
  role: string | null
}

export interface UserState {
  user: User | null
  loading: boolean
}

export interface UserActions {
  setUser: (user: User | null) => void
  setLoading: (loading: boolean) => void
  clearUser: () => void
}

export type UserStore = UserState & UserActions

export const defaultInitState: UserState = {
  user: null,
  loading: true,
}

export const createUserStore = (initState: UserState = defaultInitState) => {
  return createStore<UserStore>()((set) => ({
    ...initState,
    setUser: (user) => set({ user, loading: false }),
    setLoading: (loading) => set({ loading }),
    clearUser: () => set({ user: null, loading: false }),
  }))
}
