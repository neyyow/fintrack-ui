import React from 'react'

export default function CategoryStamp({ meta, size = 40 }) {
  return (
    <div
      className="stamp"
      style={{
        width: size,
        height: size,
        backgroundColor: `${meta.color}1F`, // ~12% alpha
        color: meta.color,
      }}
      title={meta.name}
    >
      <span className="font-display font-semibold" style={{ fontSize: size * 0.36 }}>
        {meta.initial}
      </span>
    </div>
  )
}
