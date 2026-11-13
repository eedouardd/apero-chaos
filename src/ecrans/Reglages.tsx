import { Bouton } from '../composants/Bouton'
import { Cadre } from '../composants/Cadre'
import { ChoixSegmente } from '../composants/ChoixSegmente'
import type { Intensite, Reglages as TypeReglages, Ton } from '../types'

interface Props {
  reglages: TypeReglages
  onChange: (reglages: TypeReglages) => void
  onRetour: () => void
  onSuivant: () => void
}

const TONS: { valeur: Ton; libelle: string; detail: string }[] = [
  { valeur: 'tout-public', libelle: '😇 Tout public', detail: 'Drôle et gentil, pour tous les groupes' },
  { valeur: 'pimente', libelle: '🌶️ Étudiant pimenté', detail: 'Dossiers, flirt et mauvaise foi' },
  { valeur: 'hard', libelle: '😈 Hard', detail: 'Contenu adulte assumé, jamais dangereux' },
]

const INTENSITES: { valeur: Intensite; libelle: string; detail: string }[] = [
  { valeur: 'soft', libelle: 'Soft', detail: 'Petites gorgées, défis tranquilles' },
  { valeur: 'normal', libelle: 'Normal', detail: 'Le bon équilibre' },
  { valeur: 'hard', libelle: 'Hard', detail: 'Plus de gorgées, défis corsés' },
]

interface PropsInterrupteur {
  libelle: string
  detail: string
  actif: boolean
  onBasculer: () => void
}

function Interrupteur({ libelle, detail, actif, onBasculer }: PropsInterrupteur) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={actif}
      onClick={onBasculer}
      className="flex min-h-14 w-full items-center justify-between gap-3 rounded-2xl border-2 border-trait bg-surface px-4 py-2 text-left active:scale-[0.98]"
    >
      <span>
        <span className="block text-lg font-semibold">{libelle}</span>
        <span className="block text-sm text-texte-doux">{detail}</span>
      </span>
      <span
        aria-hidden="true"
        className={`relative h-8 w-14 shrink-0 rounded-full transition-colors duration-200 ${
          actif ? 'bg-accent' : 'bg-trait'
        }`}
      >
        <span
          className={`absolute top-1 left-1 size-6 rounded-full bg-texte transition-transform duration-200 ease-[var(--ease-rebond)] ${
            actif ? 'translate-x-6' : ''
          }`}
        />
      </span>
    </button>
  )
}

export function Reglages({ reglages, onChange, onRetour, onSuivant }: Props) {
  return (
    <Cadre
      titre="Réglages"
      onRetour={onRetour}
      pied={<Bouton onClick={onSuivant}>Choisir un jeu</Bouton>}
    >
      <div className="anim-apparition grid gap-6 pb-2">
        <section aria-labelledby="titre-ton">
          <h2 id="titre-ton" className="font-titre pb-2 text-lg font-bold">
            Le ton
          </h2>
          <ChoixSegmente
            legende="Ton de la partie"
            options={TONS}
            valeur={reglages.ton}
            onChange={(ton) => onChange({ ...reglages, ton })}
          />
        </section>

        <section aria-labelledby="titre-intensite">
          <h2 id="titre-intensite" className="font-titre pb-2 text-lg font-bold">
            L’intensité
          </h2>
          <ChoixSegmente
            legende="Intensité de la partie"
            options={INTENSITES}
            valeur={reglages.intensite}
            onChange={(intensite) => onChange({ ...reglages, intensite })}
          />
        </section>

        <section aria-labelledby="titre-boisson" className="grid gap-2">
          <h2 id="titre-boisson" className="font-titre text-lg font-bold">
            La boisson
          </h2>
          <Interrupteur
            libelle="🧃 Sans alcool"
            detail="Les gorgées deviennent des gages"
            actif={reglages.sansAlcool}
            onBasculer={() =>
              onChange({ ...reglages, sansAlcool: !reglages.sansAlcool })
            }
          />
          {!reglages.sansAlcool ? (
            <Interrupteur
              libelle="Boire = gorgées"
              detail="Jamais de verres entiers ni de shots"
              actif={reglages.gorgeesSeulement}
              onBasculer={() =>
                onChange({
                  ...reglages,
                  gorgeesSeulement: !reglages.gorgeesSeulement,
                })
              }
            />
          ) : null}
        </section>
      </div>
    </Cadre>
  )
}
