'use client'

import { createContext, useContext, useState, useEffect } from 'react'
import { useStore } from 'zustand'
import { createUserStore, User, UserStore } from '~/common/stores/userStore'

export type UserStoreApi = ReturnType<typeof createUserStore>

export const UserStoreContext = createContext<UserStoreApi | undefined>(undefined)

export default function UserProvider({
  user,
  children,
}: {
  user: User | null
  children: React.ReactNode
}) {
  const [store] = useState(() => createUserStore({ user, loading: false }))

  useEffect(() => {
    store.getState().setUser(user)
  }, [user, store])

  return <UserStoreContext.Provider value={store}>{children}</UserStoreContext.Provider>
}

export const useUserStore = <T,>(selector: (store: UserStore) => T): T => {
  const userStoreContext = useContext(UserStoreContext)

  if (!userStoreContext) {
    throw new Error('useUserStore must be used within UserProvider')
  }

  return useStore(userStoreContext, selector)
}
