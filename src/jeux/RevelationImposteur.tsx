import { useEffect, useState } from 'react'
import { Bouton } from '../composants/Bouton'
import { ChoixJoueur } from '../composants/ChoixJoueur'
import { TexteCarte } from '../composants/TexteCarte'
import { jouerSon, vibrer } from '../effets/sons'
import type { Manche, Verdict } from '../moteur/imposteur'
import type { Joueur } from '../types'

interface Props {
  manche: Manche
  verdict: Verdict
  joueurs: Joueur[]
  /** Dernière manche : le bouton mène au récap. */
  derniere: boolean
  /** Sans alcool, groupe trompé : l'innocent choisi par les imposteurs pour le gage. */
  onDesigner: (joueur: Joueur) => void
  onSuite: () => void
}

/** Les temps de la révélation : suspense, verdict, puis les mots et la sanction. */
const TEMPS_SUSPENSE = 0
const TEMPS_VERDICT = 1
const TEMPS_DETAILS = 2
/** Durée de chaque temps avant de passer au suivant, en millisecondes. */
const DUREES_MS = [1000, 700]
const ECART_TICS_MS = 300
const NB_TICS = 3
/** Délai avant de pouvoir toucher « Manche suivante » après avoir désigné un gage. */
const DELAI_GARDE_MS = 600

function animationsReduites(): boolean {
  return (
    typeof matchMedia === 'function' &&
    matchMedia('(prefers-reduced-motion: reduce)').matches
  )
}

/** Liste de prénoms lisible : « Léa, Max et Zoé ». */
function enumerer(prenoms: string[]): string {
  if (prenoms.length <= 1) return prenoms.join('')
  return `${prenoms.slice(0, -1).join(', ')} et ${prenoms.at(-1)}`
}

/** Révélation après le vote : l'accusé était-il l'imposteur ? Puis les mots et qui boit. */
export function RevelationImposteur({
  manche,
  verdict,
  joueurs,
  derniere,
  onDesigner,
  onSuite,
}: Props) {
  const [temps, setTemps] = useState(() =>
    animationsReduites() ? TEMPS_DETAILS : TEMPS_SUSPENSE,
  )
  // Animation sautée (ou réduite) : le son du verdict n'a pas encore été joué.
  const [verdictEntendu, setVerdictEntendu] = useState(false)

  // Enchaînement automatique des temps.
  useEffect(() => {
    const duree = DUREES_MS[temps]
    if (duree === undefined) return
    const minuteur = setTimeout(
      temps === TEMPS_SUSPENSE ? passerAuVerdict : () => setTemps(TEMPS_DETAILS),
      duree,
    )
    return () => clearTimeout(minuteur)
  }, [temps])

  // Sons et vibrations de chaque temps.
  useEffect(() => {
    if (temps === TEMPS_SUSPENSE) {
      const tics = Array.from({ length: NB_TICS }, (_, i) =>
        setTimeout(() => jouerSon('tic'), i * ECART_TICS_MS),
      )
      return () => tics.forEach(clearTimeout)
    }
    if (temps === TEMPS_VERDICT) {
      jouerSon(verdict.demasque ? 'demasque' : 'rate')
      vibrer([40, 60, 120])
      return
    }
    if (verdictEntendu) {
      if (verdict.demasque) jouerSon('victoire')
      return
    }
    jouerSon(verdict.demasque ? 'victoire' : 'rate')
    vibrer([40, 60, 120])
    // eslint-disable-next-line react-hooks/exhaustive-deps -- `verdictEntendu` est lu à l'arrivée sur chaque temps, pas suivi.
  }, [temps, verdict.demasque])

  // Après la désignation du gage, le bouton de suite prend la place des prénoms :
  // on le bloque un instant pour qu'un double tap ne saute pas la manche.
  const [suiteBloquee, setSuiteBloquee] = useState(false)
  useEffect(() => {
    if (!suiteBloquee) return
    const minuteur = setTimeout(() => setSuiteBloquee(false), DELAI_GARDE_MS)
    return () => clearTimeout(minuteur)
  }, [suiteBloquee])

  function designer(joueur: Joueur) {
    setSuiteBloquee(true)
    onDesigner(joueur)
  }

  function passerAuVerdict() {
    setVerdictEntendu(true)
    setTemps(TEMPS_VERDICT)
  }

  const imposteurs = joueurs.filter((j) => manche.imposteurs.includes(j.id))
  const innocents = joueurs.filter((j) => !manche.imposteurs.includes(j.id))
  const rescapes = imposteurs.filter((j) => j.id !== verdict.accuse.id)

  // Vert quand le groupe a vu juste, rouge quand il s'est fait avoir.
  const couleurVerdict = verdict.demasque ? '' : '[--accent:var(--color-neon-rouge)]'

  if (temps < TEMPS_DETAILS) {
    return (
      <button
        type="button"
        aria-label="Passer l’animation"
        onClick={() => setTemps(TEMPS_DETAILS)}
        className="m-auto grid w-full gap-4 py-8 text-center"
      >
        <span
          aria-hidden="true"
          className={`text-7xl ${temps === TEMPS_SUSPENSE ? 'anim-secousse' : ''}`}
        >
          🕵️
        </span>
        <span className="anim-apparition text-xl text-texte-doux">
          <strong className="font-titre text-texte">{verdict.accuse.prenom}</strong> était…
        </span>
        <span className="min-h-20" aria-live="assertive">
          {temps === TEMPS_VERDICT ? (
            <span
              className={`font-titre texte-neon anim-tampon block text-[clamp(2rem,10vw,3.25rem)] leading-tight font-black uppercase ${couleurVerdict}`}
            >
              {verdict.demasque ? 'Imposteur !' : 'Innocent !'}
            </span>
          ) : null}
        </span>
      </button>
    )
  }

  const titre = verdict.demasque
    ? 'Démasqué !'
    : imposteurs.length > 1
      ? 'Raté, ils vous ont eus !'
      : 'Raté, il vous a eus !'

  const camps = [
    { titre: 'Innocents', mot: manche.motInnocents, membres: innocents, accent: false },
    {
      titre: imposteurs.length > 1 ? 'Imposteurs' : 'Imposteur',
      mot: manche.motImposteurs,
      membres: imposteurs,
      accent: true,
    },
  ]

  return (
    <div className="anim-apparition flex flex-1 flex-col gap-4">
      <p
        className={`font-titre texte-neon text-center text-2xl leading-tight font-black uppercase ${couleurVerdict}`}
      >
        {titre}
      </p>
      <p className="text-center text-texte-doux">
        Vous avez accusé{' '}
        <strong className="text-texte">{verdict.accuse.prenom}</strong>
        {verdict.demasque ? ' : bien vu.' : ', qui n’y était pour rien.'}
      </p>

      <ul className="grid gap-3">
        {camps.map((camp) => (
          <li
            key={camp.titre}
            className={`rounded-3xl p-4 ${camp.accent ? 'lueur bg-surface-2' : 'bg-surface'}`}
          >
            <span className="block text-xs tracking-wider text-texte-doux uppercase">
              {camp.titre}
            </span>
            <span
              className={`font-titre block text-2xl font-bold ${camp.accent ? 'text-accent' : ''}`}
            >
              {camp.mot}
            </span>
            <span className="block text-sm text-texte-doux">
              {enumerer(camp.membres.map((j) => j.prenom))}
            </span>
          </li>
        ))}
      </ul>

      {verdict.demasque && rescapes.length > 0 ? (
        <p className="text-center text-sm text-texte-doux">
          {enumerer(rescapes.map((j) => j.prenom))} était aussi imposteur… et s’en sort.
        </p>
      ) : null}

      <div className="mt-auto grid gap-3" aria-live="polite">
        <p className="rounded-2xl bg-nuit/60 p-3 text-center text-xl font-semibold">
          <TexteCarte segments={verdict.segments} />
        </p>
        {verdict.note ? (
          <p className="text-center text-sm text-texte-doux">{verdict.note}</p>
        ) : null}
        {verdict.gageADesigner ? (
          <>
            <p className="text-center text-sm text-texte-doux">
              {imposteurs.length > 1
                ? 'Imposteurs, touchez l’innocent qui fait le gage.'
                : 'Imposteur, touche l’innocent qui fait le gage.'}
            </p>
            <ChoixJoueur joueurs={innocents} onChoisir={designer} />
          </>
        ) : (
          <Bouton disabled={suiteBloquee} onClick={onSuite}>
            {derniere ? 'Voir le récap' : 'Manche suivante'}
          </Bouton>
        )}
      </div>
    </div>
  )
}
