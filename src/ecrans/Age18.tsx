import { Bouton } from '../composants/Bouton'
import { Cadre } from '../composants/Cadre'

interface Props {
  /** Partie sans alcool : l'avertissement ne porte que sur le contenu. */
  sansAlcool: boolean
  onConfirmer: () => void
  onRetour: () => void
}

/** Avertissement +18, affiché dès que la partie contient de l'alcool ou du contenu adulte. */
export function Age18({ sansAlcool, onConfirmer, onRetour }: Props) {
  return (
    <Cadre
      titre="Avant de jouer"
      onRetour={onRetour}
      pied={
        <div className="grid gap-2">
          <Bouton onClick={onConfirmer}>On a tous 18 ans ou plus</Bouton>
          <Bouton variante="discret" onClick={onRetour}>
            Revenir aux réglages
          </Bouton>
        </div>
      }
    >
      <div className="anim-apparition flex flex-1 flex-col items-center justify-center gap-6 text-center">
        <p className="font-titre texte-neon text-7xl font-black">18+</p>
        <h2 className="font-titre text-2xl font-bold">Réservé aux adultes</h2>
        <ul className="grid gap-3 text-left text-lg text-texte-doux">
          {sansAlcool ? (
            <li>🌶️ Les cartes de ce ton parlent de séduction et de vie intime.</li>
          ) : (
            <li>🍻 On boit par gorgées, jamais cul sec, et chacun à son rythme.</li>
          )}
          <li>
            🙅 Personne n’est obligé de faire une carte. Refuser coûte{' '}
            {sansAlcool
              ? 'le gage affiché sur la carte'
              : 'les gorgées affichées sur la carte : 1 pour une carte facile, jamais plus de 5 pour une difficile'}
            .
          </li>
          {sansAlcool ? null : (
            <>
              <li>🚗 Celui qui conduit ne boit pas.</li>
              <li>💧 Un verre d’eau de temps en temps, c’est pas de la triche.</li>
            </>
          )}
        </ul>
        {sansAlcool ? null : (
          <p className="text-sm text-texte-doux/70">
            L’abus d’alcool est dangereux pour la santé.
          </p>
        )}
      </div>
    </Cadre>
  )
}
