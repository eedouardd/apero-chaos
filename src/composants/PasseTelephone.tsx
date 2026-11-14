import { Bouton } from './Bouton'

interface Props {
  prenom: string
  /** Le bon joueur a le téléphone en main. */
  onPret: () => void
}

/** Écran « barrage » entre deux joueurs : rien de secret n'y est affiché. */
export function PasseTelephone({ prenom, onPret }: Props) {
  return (
    <div className="anim-apparition m-auto grid w-full gap-6 text-center">
      <p className="text-lg text-texte-doux">Passe le téléphone à</p>
      <p className="font-titre texte-neon text-[clamp(2.75rem,14vw,4.5rem)] leading-none font-black break-words uppercase">
        {prenom}
      </p>
      <Bouton className="min-h-16" onClick={onPret}>
        C’est moi
      </Bouton>
    </div>
  )
}
