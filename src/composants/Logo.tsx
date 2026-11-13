/** Logo : deux verres néon qui trinquent, avec un éclair de chaos au milieu. */
export function Logo({ taille = 150 }: { taille?: number }) {
  return (
    <svg
      width={taille}
      height={taille}
      viewBox="0 0 120 120"
      role="img"
      aria-label="Logo Apéro Chaos"
      fill="none"
      strokeWidth="4"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ filter: 'drop-shadow(0 0 10px rgba(255,61,154,0.7))' }}
    >
      {/* Verre rose, penché vers la droite */}
      <g transform="rotate(14 38 66)" stroke="#ff3d9a">
        <path d="M22 34h32l-4 46a6 6 0 0 1-6 5H32a6 6 0 0 1-6-5z" />
        <path d="M24 52h28" />
      </g>
      {/* Verre cyan, penché vers la gauche */}
      <g transform="rotate(-14 82 66)" stroke="#2ef2ff">
        <path d="M66 34h32l-4 46a6 6 0 0 1-6 5H76a6 6 0 0 1-6-5z" />
        <path d="M68 52h28" />
      </g>
      {/* Éclair jaune */}
      <path d="M63 6 52 24h14L55 42" stroke="#ffe14d" />
      {/* Éclaboussures */}
      <path d="M30 18l-4-6M92 18l4-6M16 30l-7-2M104 30l7-2" stroke="#ffe14d" />
    </svg>
  )
}
