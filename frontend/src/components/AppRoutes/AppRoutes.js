import React from 'react'
import { Route, Routes } from 'react-router-dom'
import HomePage from '../Home/Home'

export default function AppRoutes() {
  return (
    <Routes>
        <Route path="/" element={<HomePage />} />
    </Routes>
  )
}
