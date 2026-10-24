import React from 'react'
import { getMe } from '~/actions/auth'
import UserProvider from '~/providers/UserProvider'

export default async function ExamLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getMe()

  return (
    <UserProvider user={user}>
      <div className="min-h-screen bg-[#f8f9fa] flex flex-col antialiased">
        {children}
      </div>
    </UserProvider>
  )
}
