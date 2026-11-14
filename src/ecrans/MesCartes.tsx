import { useRef, useState, type FormEvent } from 'react'
import { Bouton } from '../composants/Bouton'
import { Cadre } from '../composants/Cadre'
import { jouerSon, vibrer } from '../effets/sons'
import { JEU_MES_CARTES } from '../jeux/catalogue'
import {
  NB_CARTES_PERSO_MAX,
  NB_CARTES_PERSO_MIN,
  verifierCartePerso,
} from '../moteur/cartesPerso'

interface Props {
  cartes: string[]
  onChange: (cartes: string[]) => void
  onRetour: () => void
  onJouer: () => void
}

/** Raccourcis qui insèrent un jeton dans le texte, sans avoir à taper d'accolades. */
const RACCOURCIS = [
  { libelle: '+ Un joueur', jeton: '{j1}' },
  { libelle: '+ Un 2e joueur', jeton: '{j2}' },
  { libelle: '+ Gorgées', jeton: '{bois:2}' },
]

/** Affiche les jetons d'une carte sauvegardée sous une forme lisible. */
function apercu(texte: string): string {
  return texte
    .replaceAll('{j1}', 'Joueur 1')
    .replaceAll('{j2}', 'Joueur 2')
    .replace(/\{(bois|boit|boivent|buvez|distribue|gorgees):(\d)\}/g, (_, verbe: string, nb: string) =>
      verbe === 'gorgees' ? `${nb} gorgée(s)` : `${verbe} ${nb} gorgée(s)`,
    )
}

/** « Mes cartes » : le groupe écrit ses propres cartes, gardées sur ce téléphone. */
export function MesCartes({ cartes, onChange, onRetour, onJouer }: Props) {
  const [saisie, setSaisie] = useState('')
  const [erreur, setErreur] = useState<string | null>(null)
  const champ = useRef<HTMLTextAreaElement>(null)
  const manque = Math.max(0, NB_CARTES_PERSO_MIN - cartes.length)

  function ajouter(evenement: FormEvent) {
    evenement.preventDefault()
    const resultat = verifierCartePerso(saisie, cartes)
    if (!resultat.ok) {
      setErreur(resultat.erreur)
      vibrer([30, 40, 30])
      return
    }
    jouerSon('carte')
    onChange([resultat.texte, ...cartes])
    setSaisie('')
    setErreur(null)
  }

  function inserer(jeton: string) {
    setSaisie((texte) => `${texte}${texte === '' || texte.endsWith(' ') ? '' : ' '}${jeton} `)
    setErreur(null)
    champ.current?.focus()
  }

  return (
    <Cadre
      titre="Mes cartes"
      couleur={JEU_MES_CARTES.couleur}
      onRetour={onRetour}
      pied={
        <Bouton onClick={onJouer} disabled={manque > 0}>
          {manque > 0
            ? `Encore ${manque} carte${manque > 1 ? 's' : ''} pour jouer`
            : `Jouer avec ${cartes.length} cartes`}
        </Bouton>
      }
    >
      <form onSubmit={ajouter} className="grid gap-2">
        <label htmlFor="carte-perso" className="text-base text-texte-doux">
          Écris un défi, une question ou une règle.
        </label>
        <textarea
          id="carte-perso"
          ref={champ}
          value={saisie}
          onChange={(e) => {
            setSaisie(e.target.value)
            setErreur(null)
          }}
          rows={3}
          disabled={cartes.length >= NB_CARTES_PERSO_MAX}
          placeholder="Ex. : {j1}, imite {j2}. Raté ? {bois:2}."
          aria-invalid={erreur !== null}
          aria-describedby={erreur ? 'erreur-carte' : 'aide-carte'}
          className="w-full rounded-2xl border-2 border-trait bg-surface p-3 text-lg font-semibold placeholder:font-normal placeholder:text-texte-doux/60 focus:border-accent focus:outline-none"
        />
        <div className="flex flex-wrap gap-2">
          {RACCOURCIS.map((raccourci) => (
            <button
              key={raccourci.jeton}
              type="button"
              onClick={() => inserer(raccourci.jeton)}
              className="min-h-11 rounded-full border-2 border-trait bg-surface-2 px-3 text-sm font-semibold active:scale-95"
            >
              {raccourci.libelle}
            </button>
          ))}
        </div>
        {erreur ? (
          <p id="erreur-carte" role="alert" className="text-base font-semibold text-neon-rouge">
            {erreur}
          </p>
        ) : (
          <p id="aide-carte" className="text-sm text-texte-doux">
            Reste fun : rien de dangereux ni d’humiliant, 5 gorgées maximum. Les cartes restent sur
            ce téléphone.
          </p>
        )}
        <Bouton type="submit" variante="contour" disabled={saisie.trim() === ''}>
          Ajouter la carte
        </Bouton>
      </form>

      <h2 className="font-titre pt-5 pb-2 text-sm font-semibold tracking-widest text-texte-doux uppercase">
        {cartes.length === 0
          ? 'Aucune carte pour l’instant'
          : `${cartes.length} carte${cartes.length > 1 ? 's' : ''}`}
      </h2>
      <ul className="grid gap-2 pb-4">
        {cartes.map((texte) => (
          <li
            key={texte}
            className="flex items-center gap-2 rounded-2xl bg-surface p-3 text-base"
          >
            <span className="min-w-0 flex-1 [overflow-wrap:anywhere]">{apercu(texte)}</span>
            <button
              type="button"
              aria-label={`Supprimer la carte : ${apercu(texte)}`}
              onClick={() => onChange(cartes.filter((carte) => carte !== texte))}
              className="grid size-11 shrink-0 place-items-center rounded-full bg-surface-2 text-lg active:scale-90"
            >
              ✕
            </button>
          </li>
        ))}
      </ul>
    </Cadre>
  )
}
