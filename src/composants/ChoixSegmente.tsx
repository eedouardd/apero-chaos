import { jouerSon, vibrer } from '../effets/sons'

interface Option<T extends string> {
  valeur: T
  libelle: string
  /** Petite précision sous le libellé. */
  detail?: string
}

interface Props<T extends string> {
  /** Nom du groupe, lu par les lecteurs d'écran. */
  legende: string
  options: Option<T>[]
  valeur: T
  onChange: (valeur: T) => void
}

/** Groupe de gros boutons à choix unique (ton, intensité…). */
export function ChoixSegmente<T extends string>({
  legende,
  options,
  valeur,
  onChange,
}: Props<T>) {
  return (
    <div role="radiogroup" aria-label={legende} className="grid gap-2">
      {options.map((option) => {
        const actif = option.valeur === valeur
        return (
          <button
            key={option.valeur}
            type="button"
            role="radio"
            aria-checked={actif}
            onClick={() => {
              jouerSon('tap')
              vibrer()
              onChange(option.valeur)
            }}
            className={`flex min-h-14 items-center justify-between gap-3 rounded-2xl border-2 px-4 py-2 text-left transition-colors duration-150 active:scale-[0.98] ${
              actif
                ? 'border-accent bg-accent/15 text-texte'
                : 'border-trait bg-surface text-texte-doux'
            }`}
          >
            <span>
              <span className="block text-lg font-semibold">{option.libelle}</span>
              {option.detail ? (
                <span className="block text-sm opacity-80">{option.detail}</span>
              ) : null}
            </span>
            <span
              aria-hidden="true"
              className={`grid size-6 shrink-0 place-items-center rounded-full border-2 ${
                actif ? 'border-accent bg-accent text-nuit' : 'border-trait'
              }`}
            >
              {actif ? '✓' : ''}
            </span>
          </button>
        )
      })}
    </div>
  )
}
