import { useEffect } from 'react'
import { Bouton } from '../composants/Bouton'
import { Cadre } from '../composants/Cadre'
import { jouerSon, vibrer } from '../effets/sons'
import type { DefinitionJeu } from '../jeux/catalogue'
import { calculerTrophees } from '../moteur/recap'
import type { Joueur, StatsPartie } from '../types'

interface Props {
  jeu: DefinitionJeu
  joueurs: Joueur[]
  stats: StatsPartie
  sansAlcool: boolean
  onRejouer: () => void
  onChangerJeu: () => void
  onAccueil: () => void
}

export function Fin({
  jeu,
  joueurs,
  stats,
  sansAlcool,
  onRejouer,
  onChangerJeu,
  onAccueil,
}: Props) {
  const trophees = calculerTrophees(joueurs, stats, sansAlcool)

  useEffect(() => {
    jouerSon('victoire')
    vibrer([40, 60, 40, 60, 120])
  }, [])

  return (
    <Cadre
      titre="Fin de partie"
      couleur={jeu.couleur}
      pied={
        <div className="grid gap-2">
          <Bouton onClick={onRejouer}>Rejouer</Bouton>
          <Bouton variante="contour" onClick={onChangerJeu}>
            Changer de jeu
          </Bouton>
          <Bouton variante="discret" onClick={onAccueil}>
            Retour à l’accueil
          </Bouton>
        </div>
      }
    >
      <div className="anim-apparition flex flex-1 flex-col gap-5">
        <div className="text-center">
          <p className="text-6xl" aria-hidden="true">
            🏁
          </p>
          <h2 className="font-titre texte-neon pt-2 text-3xl font-black uppercase">
            Bien joué !
          </h2>
          <p className="pt-1 text-texte-doux">
            {stats.cartesJouees} carte{stats.cartesJouees > 1 ? 's' : ''} de{' '}
            {jeu.nom} et tout le monde est encore debout.
          </p>
        </div>

        {trophees.length > 0 ? (
          <ul className="grid gap-3">
            {trophees.map((trophee, index) => (
              <li
                key={trophee.titre}
                className="anim-apparition flex items-center gap-4 rounded-3xl bg-surface p-4"
                style={{ animationDelay: `${200 + index * 150}ms` }}
              >
                <span className="text-4xl" aria-hidden="true">
                  {trophee.emoji}
                </span>
                <span>
                  <span className="block text-xs tracking-wider text-texte-doux uppercase">
                    {trophee.titre}
                  </span>
                  <span className="font-titre block text-xl font-bold text-accent">
                    {trophee.prenom}
                  </span>
                  <span className="block text-sm text-texte-doux">
                    {trophee.detail}
                  </span>
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-center text-texte-doux">
            Partie éclair : pas le temps de distribuer des trophées !
          </p>
        )}
      </div>
    </Cadre>
  )
}
