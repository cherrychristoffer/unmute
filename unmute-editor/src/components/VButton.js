import React from 'react'

export default function VButton({ text, color = 'rose', className, onClick }) {
  return color === 'rose' ? (
    <button
      className={`flex justify-center text-white bg-rose-500 border border-rose-600 focus:outline-none hover:bg-rose-600 focus:ring-4 focus:ring-rose font-medium rounded-xl tracking-tight px-6 py-2.5 cursor-pointer text-center ${className}`}
      onClick={onClick}
    >
      {text}
    </button>
  ) : color === 'red' ? (
    <button
      className={`flex justify-center text-white bg-red-500 border border-red-600 focus:outline-none hover:bg-red-600 focus:ring-4 focus:ring-red font-medium rounded-xl tracking-tight px-6 py-2.5 cursor-pointer text-center ${className}`}
      onClick={onClick}
    >
      {text}
    </button>
  ) : color === 'white' ? (
    <button
      className={`flex justify-center text-rose-600 bg-white border border-rose-600 focus:outline-none hover:bg-rose-600 hover:text-white focus:ring-4 focus:ring-rose font-medium rounded-xl tracking-tight px-6 py-2.5 cursor-pointer ${className}`}
      onClick={onClick}
    >
      {text}
    </button>
  ) : color === 'black' ? (
    <button
      className={`flex justify-center text-white bg-black border border-black focus:outline-none hover:bg-white hover:text-black focus:ring-4 focus:ring-rose font-medium rounded-xl tracking-tight px-6 py-2.5 cursor-pointer ${className}`}
      onClick={onClick}
    >
      {text}
    </button>
  ) : (
    <button
      className={`flex justify-center text-white bg-green-500 border border-green-600 focus:outline-none hover:bg-green-600 focus:ring-4 focus:ring-green font-medium rounded-xl tracking-tight px-6 py-2.5 cursor-pointer text-center ${className}`}
      onClick={onClick}
    >
      {text}
    </button>
  )
}
