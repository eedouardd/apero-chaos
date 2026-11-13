import { useCallback, useMemo, useState } from 'react'
import { Bouton } from '../composants/Bouton'
import { Cadre } from '../composants/Cadre'
import { CarteVue } from '../composants/CarteVue'
import { Fenetre } from '../composants/Fenetre'
import { CARTES, GAGES } from '../contenu'
import { jouerSon, vibrer } from '../effets/sons'
import type { PropsPartie } from '../ecrans/Partie'
import { construirePaquet } from '../moteur/cartes'
import { gagesAutorises, tirerGage } from '../moteur/gages'
import { calculerStats } from '../moteur/recap'
import { cartesVues, noterCartesVues } from './memoire'

/** Nombre de cartes d'une partie. */
const TAILLE_PAQUET = 25

/**
 * Jeu de cartes générique : sert à « Défis & Vérités » et aux autres jeux
 * qui consistent à lire une carte puis passer à la suivante.
 */
export function JeuCartes({ jeu, joueurs, reglages, onQuitter, onFin }: PropsPartie) {
  // Le paquet est fabriqué une seule fois, au début de la partie.
  const [paquet] = useState(() =>
    construirePaquet(CARTES[jeu.id], joueurs, reglages, {
      taille: TAILLE_PAQUET,
      dejaVues: cartesVues(jeu.id),
    }),
  )
  const [index, setIndex] = useState(0)
  const [enPause, setEnPause] = useState(false)
  const [gage, setGage] = useState<string | null>(null)

  const gages = useMemo(
    () => gagesAutorises(GAGES, joueurs, reglages),
    [joueurs, reglages],
  )

  const terminer = useCallback(
    (nbCartesVues: number) => {
      const vues = paquet.slice(0, nbCartesVues)
      noterCartesVues(
        jeu.id,
        vues.map((jouee) => jouee.carte.id),
      )
      onFin(calculerStats(vues))
    },
    [paquet, jeu.id, onFin],
  )

  const fermerPause = useCallback(() => setEnPause(false), [])
  const fermerGage = useCallback(() => setGage(null), [])

  function carteSuivante() {
    jouerSon('carte')
    vibrer(20)
    if (index + 1 >= paquet.length) {
      terminer(paquet.length)
      return
    }
    setIndex(index + 1)
  }

  const jouee = paquet[index]

  // Réglages trop stricts pour ce groupe : aucune carte ne passe le filtre.
  if (jouee === undefined) {
    return (
      <Cadre titre={jeu.nom} couleur={jeu.couleur} onRetour={onQuitter}>
        <div className="m-auto grid gap-4 text-center">
          <p className="text-5xl" aria-hidden="true">
            🫥
          </p>
          <p className="text-lg text-texte-doux">
            Aucune carte ne correspond à vos réglages et à vos profils. Essayez
            un autre ton ou une autre intensité.
          </p>
          <Bouton variante="contour" onClick={onQuitter}>
            Changer de jeu
          </Bouton>
        </div>
      </Cadre>
    )
  }

  const derniere = index + 1 >= paquet.length

  return (
    <Cadre
      titre={jeu.nom}
      couleur={jeu.couleur}
      onRetour={() => setEnPause(true)}
      iconeRetour="⏸"
      libelleRetour="Mettre en pause"
      pied={
        <Bouton variante="contour" onClick={() => setGage(tirerGage(gages, gage))}>
          🎭 Tirer un gage
        </Bouton>
      }
    >
      <div
        className="mb-3 flex items-center gap-3"
        role="progressbar"
        aria-label="Avancement de la partie"
        aria-valuemin={1}
        aria-valuemax={paquet.length}
        aria-valuenow={index + 1}
      >
        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-surface-2">
          <div
            className="h-full origin-left rounded-full bg-accent transition-transform duration-300"
            style={{ transform: `scaleX(${(index + 1) / paquet.length})` }}
          />
        </div>
        <span className="text-sm text-texte-doux tabular-nums">
          {index + 1} / {paquet.length}
        </span>
      </div>

      <CarteVue
        key={jouee.carte.id}
        jouee={jouee}
        indice={derniere ? 'Touche pour voir le récap' : 'Touche la carte pour continuer'}
        onSuivante={carteSuivante}
      />

      {enPause ? (
        <Fenetre titre="Pause" onFermer={fermerPause}>
          <div className="grid gap-2">
            <Bouton onClick={fermerPause}>Reprendre</Bouton>
            <Bouton variante="contour" onClick={() => terminer(index + 1)}>
              Terminer la partie
            </Bouton>
            <Bouton variante="discret" onClick={onQuitter}>
              Quitter sans récap
            </Bouton>
          </div>
        </Fenetre>
      ) : null}

      {gage !== null ? (
        <Fenetre titre="Gage" onFermer={fermerGage}>
          <p className="pb-5 text-center text-2xl leading-snug font-semibold">
            {gage}
          </p>
          <div className="grid gap-2">
            <Bouton onClick={fermerGage}>C’est fait</Bouton>
            <Bouton
              variante="discret"
              onClick={() => setGage(tirerGage(gages, gage))}
            >
              Un autre gage
            </Bouton>
          </div>
        </Fenetre>
      ) : null}
    </Cadre>
  )
}
