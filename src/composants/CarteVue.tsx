import type { CarteJouee } from '../types'

interface Props {
  jouee: CarteJouee
  /** Petit texte en bas de la carte. */
  indice: string
  onSuivante: () => void
}

/** Au-delà de cette longueur, le texte est affiché un peu plus petit pour tenir sur l'écran. */
const LONGUEUR_TEXTE_LONG = 150

/** Une grande carte lisible : on touche n'importe où pour passer à la suivante. */
export function CarteVue({ jouee, indice, onSuivante }: Props) {
  const longueur = jouee.segments.reduce((total, s) => total + s.valeur.length, 0)
  const tailleTexte =
    longueur > LONGUEUR_TEXTE_LONG ? 'text-[1.35rem]' : 'text-[1.7rem]'

  return (
    <button
      type="button"
      onClick={onSuivante}
      className="anim-retournement lueur flex min-h-0 w-full flex-1 flex-col rounded-[2rem] bg-linear-to-b from-surface-2 to-surface p-6 text-left active:scale-[0.98]"
    >
      {jouee.carte.categorie ? (
        <span className="font-titre self-start rounded-full bg-accent px-3 py-1 text-xs font-bold tracking-wider text-nuit uppercase">
          {jouee.carte.categorie}
        </span>
      ) : null}
      <span
        className={`my-auto block py-4 leading-snug font-semibold ${tailleTexte}`}
      >
        {jouee.segments.map((segment, index) => {
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
      </span>
      <span className="self-center text-sm text-texte-doux">{indice}</span>
    </button>
  )
}
