import { useGardeToucher } from '../effets/garde'
import type { CarteJouee, Segment } from '../types'
import { TexteCarte } from './TexteCarte'

interface Props {
  jouee: CarteJouee
  /** Consigne du jeu rappelée sous le texte (ex. « Ceux qui l'ont fait boivent »). */
  consigne?: Segment[]
  /** Petit texte en bas de la carte. */
  indice: string
  onSuivante: () => void
}

/** Paliers de taille : les cartes courtes se lisent de loin, les longues tiennent sur l'écran. */
const LONGUEUR_TEXTE_COURT = 90
const LONGUEUR_TEXTE_LONG = 150

function tailleSelonLongueur(longueur: number): string {
  if (longueur <= LONGUEUR_TEXTE_COURT) return 'text-[2.1rem]'
  if (longueur <= LONGUEUR_TEXTE_LONG) return 'text-[1.7rem]'
  return 'text-[1.4rem]'
}

/** Une grande carte lisible : on touche n'importe où pour passer à la suivante. */
export function CarteVue({ jouee, consigne, indice, onSuivante }: Props) {
  const longueur = jouee.segments.reduce((total, s) => total + s.valeur.length, 0)
  const tailleTexte = tailleSelonLongueur(longueur)
  // Une carte qui vient d'arriver ignore les touchers : pas de carte sautée par un double tap.
  const tropTot = useGardeToucher(jouee.carte.id)

  return (
    <button
      type="button"
      onClick={() => {
        if (!tropTot()) onSuivante()
      }}
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
        <TexteCarte segments={jouee.segments} />
      </span>
      {consigne ? (
        <span className="mb-3 block border-t-2 border-trait pt-3 text-lg text-texte">
          <TexteCarte segments={consigne} />
        </span>
      ) : null}
      <span className="self-center text-base text-texte-doux">{indice}</span>
    </button>
  )
}
