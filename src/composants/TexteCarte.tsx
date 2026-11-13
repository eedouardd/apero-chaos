import type { Segment } from '../types'

/** Affiche un texte de carte : prénoms en néon, boissons en jaune. */
export function TexteCarte({ segments }: { segments: Segment[] }) {
  return (
    <>
      {segments.map((segment, index) => {
        if (segment.type === 'joueur') {
          return (
            <strong key={index} className="font-titre texte-neon font-black">
              {segment.valeur}
            </strong>
          )
        }
        if (segment.type === 'boisson') {
          return (
            <strong key={index} className="font-bold text-neon-jaune">
              {segment.valeur}
            </strong>
          )
        }
        return <span key={index}>{segment.valeur}</span>
      })}
    </>
  )
}
