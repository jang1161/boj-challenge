import React, { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { supabase } from './supabaseClient'
import Auth from './pages/Auth'
import GroupList from './pages/GroupList'
import CreateGroup from './pages/CreateGroup'
import GroupDetail from './pages/GroupDetail'
import UserProfile from './pages/UserProfile'
import ManageProfile from './pages/ManageProfile'

export default function App() {
  const [session, setSession] = useState(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => subscription.unsubscribe()
  }, [])

  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={<GroupList session={session} />}
        />
        <Route
          path="/login"
          element={
            session ? (
              <Navigate to="/" replace />
            ) : (
              <Auth />
            )
          }
        />
        <Route
          path="/create"
          element={
            session ? (
              <CreateGroup session={session} />
            ) : (
              <Navigate to="/" replace />
            )
          }
        />
        <Route
          path="/groups/:groupId"
          element={<GroupDetail />}
        />
        <Route
          path="/users/:userId"
          element={<UserProfile />}
        />
        // App.jsx 또는 Routes.jsx
        <Route path="/profile" element={<ManageProfile />} />

      </Routes>
    </Router>
  )
}
