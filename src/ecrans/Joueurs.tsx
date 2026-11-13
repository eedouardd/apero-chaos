import { useState, type FormEvent } from 'react'
import { Bouton } from '../composants/Bouton'
import { Cadre } from '../composants/Cadre'
import { jouerSon, vibrer } from '../effets/sons'
import { creerJoueur, nouvelId } from '../moteur/joueurs'
import {
  LONGUEUR_PRENOM_MAX,
  NB_JOUEURS_MAX,
  NB_JOUEURS_MIN,
  type Joueur,
} from '../types'

interface Props {
  joueurs: Joueur[]
  onChange: (joueurs: Joueur[]) => void
  onRetour: () => void
  onSuivant: () => void
}

type CleProfil = 'defisPhysiques' | 'questionsIntimes' | 'boitAlcool'

/** Les 3 questions du mini-questionnaire. */
const QUESTIONS: {
  cle: CleProfil
  emoji: string
  question: string
  oui: string
  non: string
}[] = [
  {
    cle: 'defisPhysiques',
    emoji: '💪',
    question: 'Les défis physiques ?',
    oui: 'J’adore',
    non: 'Sans moi',
  },
  {
    cle: 'questionsIntimes',
    emoji: '🌶️',
    question: 'Les questions gênantes ?',
    oui: 'Balance',
    non: 'Non merci',
  },
  {
    cle: 'boitAlcool',
    emoji: '🍺',
    question: 'Tu bois de l’alcool ?',
    oui: 'Oui',
    non: 'Sans alcool',
  },
]

export function Joueurs({ joueurs, onChange, onRetour, onSuivant }: Props) {
  const [saisie, setSaisie] = useState('')
  const [erreur, setErreur] = useState<string | null>(null)
  // Joueur dont le questionnaire est déplié.
  const [ouvert, setOuvert] = useState<string | null>(null)

  const complet = joueurs.length >= NB_JOUEURS_MAX
  const manque = Math.max(0, NB_JOUEURS_MIN - joueurs.length)

  function ajouter(evenement: FormEvent) {
    evenement.preventDefault()
    const resultat = creerJoueur(saisie, joueurs, nouvelId())
    if (!resultat.ok) {
      setErreur(resultat.erreur)
      vibrer([30, 40, 30])
      return
    }
    jouerSon('carte')
    onChange([...joueurs, resultat.joueur])
    setOuvert(resultat.joueur.id)
    setSaisie('')
    setErreur(null)
  }

  function modifier(id: string, cle: CleProfil, valeur: boolean) {
    jouerSon('tap')
    onChange(joueurs.map((j) => (j.id === id ? { ...j, [cle]: valeur } : j)))
  }

  function retirer(id: string) {
    onChange(joueurs.filter((j) => j.id !== id))
  }

  return (
    <Cadre
      titre="Les joueurs"
      onRetour={onRetour}
      pied={
        <Bouton onClick={onSuivant} disabled={manque > 0}>
          {manque > 0
            ? `Encore ${manque} joueur${manque > 1 ? 's' : ''}`
            : `C’est parti à ${joueurs.length}`}
        </Bouton>
      }
    >
      <form onSubmit={ajouter} className="flex gap-2">
        <label htmlFor="prenom" className="sr-only">
          Prénom du joueur
        </label>
        <input
          id="prenom"
          value={saisie}
          onChange={(e) => {
            setSaisie(e.target.value)
            setErreur(null)
          }}
          maxLength={LONGUEUR_PRENOM_MAX}
          placeholder={complet ? 'Table complète !' : 'Prénom'}
          disabled={complet}
          autoComplete="off"
          autoCapitalize="words"
          enterKeyHint="done"
          aria-invalid={erreur !== null}
          aria-describedby={erreur ? 'erreur-prenom' : undefined}
          className="min-h-14 min-w-0 flex-1 rounded-2xl border-2 border-trait bg-surface px-4 text-xl font-semibold placeholder:text-texte-doux/60 focus:border-accent focus:outline-none"
        />
        <button
          type="submit"
          disabled={complet}
          aria-label="Ajouter le joueur"
          className="font-titre grid size-14 shrink-0 place-items-center rounded-2xl bg-accent text-3xl font-bold text-nuit active:scale-90 disabled:opacity-35"
        >
          +
        </button>
      </form>
      <p
        id="erreur-prenom"
        role="alert"
        className="min-h-6 pt-1 text-sm font-medium text-neon-jaune"
      >
        {erreur}
      </p>

      {joueurs.length === 0 ? (
        <p className="mt-8 text-center text-texte-doux">
          Ajoute entre {NB_JOUEURS_MIN} et {NB_JOUEURS_MAX} joueurs.
          <br />
          Chacun peut préciser ses limites en 3 taps, ou passer.
        </p>
      ) : (
        <ul className="mt-1 grid gap-2 pb-2">
          {joueurs.map((joueur) => {
            const deplie = ouvert === joueur.id
            return (
              <li
                key={joueur.id}
                className="anim-apparition rounded-2xl border-2 border-trait bg-surface"
              >
                <div className="flex items-center gap-1 p-2 pl-4">
                  <button
                    type="button"
                    onClick={() => setOuvert(deplie ? null : joueur.id)}
                    aria-expanded={deplie}
                    className="flex min-h-11 min-w-0 flex-1 items-center gap-3 text-left"
                  >
                    <span className="truncate text-xl font-semibold">
                      {joueur.prenom}
                    </span>
                    <span className="shrink-0 text-base" aria-hidden="true">
                      {QUESTIONS.map((q) => (
                        <span
                          key={q.cle}
                          className={joueur[q.cle] ? '' : 'opacity-25 grayscale'}
                        >
                          {q.emoji}
                        </span>
                      ))}
                    </span>
                    <span className="ml-auto shrink-0 text-sm text-texte-doux">
                      {deplie ? 'OK' : 'Profil'}
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => retirer(joueur.id)}
                    aria-label={`Retirer ${joueur.prenom}`}
                    className="grid size-11 shrink-0 place-items-center rounded-full text-xl text-texte-doux active:scale-90"
                  >
                    ✕
                  </button>
                </div>

                {deplie ? (
                  <div className="grid gap-3 border-t-2 border-trait p-3">
                    {QUESTIONS.map((q) => (
                      <fieldset key={q.cle}>
                        <legend className="pb-1 text-sm text-texte-doux">
                          {q.emoji} {q.question}
                        </legend>
                        <div className="grid grid-cols-2 gap-2">
                          {[true, false].map((valeur) => {
                            const actif = joueur[q.cle] === valeur
                            return (
                              <button
                                key={String(valeur)}
                                type="button"
                                aria-pressed={actif}
                                onClick={() => modifier(joueur.id, q.cle, valeur)}
                                className={`min-h-12 rounded-xl border-2 px-2 text-base font-semibold active:scale-95 ${
                                  actif
                                    ? 'border-accent bg-accent/15 text-texte'
                                    : 'border-trait text-texte-doux'
                                }`}
                              >
                                {valeur ? q.oui : q.non}
                              </button>
                            )
                          })}
                        </div>
                      </fieldset>
                    ))}
                  </div>
                ) : null}
              </li>
            )
          })}
        </ul>
      )}
    </Cadre>
  )
}
