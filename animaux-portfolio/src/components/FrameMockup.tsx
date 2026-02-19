'use client'

import Image from 'next/image'
import { useState } from 'react'

interface FrameMockupProps {
  src: string
  alt: string
  className?: string
  hoverSrc?: string
}

export default function FrameMockup({ src, alt, className = '', hoverSrc }: FrameMockupProps) {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <div 
      className={`relative ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image principale */}
      <div className={`absolute inset-0 transition-opacity duration-500 ease-in-out ${isHovered && hoverSrc ? 'opacity-0' : 'opacity-100'}`}>
        <Image
          src={src}
          alt={alt}
          fill
          className="object-cover"
          placeholder="blur"
          blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
        />
      </div>

      {/* Image au hover (2ème image du produit) */}
      {hoverSrc && (
        <div className={`absolute inset-0 transition-opacity duration-500 ease-in-out ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
          <Image
            src={hoverSrc}
            alt={`${alt} - vue alternative`}
            fill
            className="object-cover"
          />
        </div>
      )}
    </div>
  )
}