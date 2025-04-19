"use client"

import { useState, useEffect } from "react"

export function useScreenDimensions() {
  const [dimensions, setDimensions] = useState({
    width: 0,
    height: 0,
    aspectRatio: 1,
  })

  useEffect(() => {
    // Function to update dimensions
    const updateDimensions = () => {
      const width = window.innerWidth
      const height = window.innerHeight
      setDimensions({
        width,
        height,
        aspectRatio: width / height,
      })
    }

    // Set dimensions on initial load
    updateDimensions()

    // Add event listener for window resize
    window.addEventListener("resize", updateDimensions)

    // Clean up event listener on component unmount
    return () => window.removeEventListener("resize", updateDimensions)
  }, [])

  return dimensions
}
