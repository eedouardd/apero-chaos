import { Cadre } from '../composants/Cadre'
import { jouerSon, vibrer } from '../effets/sons'
import { CATALOGUE } from '../jeux/catalogue'
import { PACKS_PREMIUM } from '../jeux/packs'
import { evaluerJeux } from '../moteur/recommandations'
import type { IdJeu, Joueur } from '../types'

interface Props {
  joueurs: Joueur[]
  onChoisir: (id: IdJeu) => void
  onRetour: () => void
}

export function ChoixJeu({ joueurs, onChoisir, onRetour }: Props) {
  const jeux = evaluerJeux(CATALOGUE, joueurs)

  return (
    <Cadre titre="Choisis ton jeu" onRetour={onRetour}>
      <ul className="grid gap-3 pb-4">
        {jeux.map(({ jeu, jouable, raison, recommande }, index) => {
          const disponible = jouable && jeu.pret
          return (
            <li
              key={jeu.id}
              className="anim-apparition"
              style={{ animationDelay: `${index * 45}ms` }}
            >
              <button
                type="button"
                disabled={!disponible}
                onClick={() => {
                  jouerSon('carte')
                  vibrer()
                  onChoisir(jeu.id)
                }}
                style={{ '--accent': jeu.couleur } as React.CSSProperties}
                className={`relative flex w-full items-center gap-4 rounded-3xl border-2 bg-surface p-4 text-left transition-transform duration-150 active:scale-[0.97] disabled:opacity-45 ${
                  recommande ? 'lueur border-transparent' : 'border-trait'
                }`}
              >
                <span
                  aria-hidden="true"
                  className="grid size-16 shrink-0 place-items-center rounded-2xl bg-accent/15 text-4xl"
                >
                  {jeu.emoji}
                </span>
                <span className="min-w-0 flex-1">
                  {recommande ? (
                    <span className="font-titre mb-1 inline-block rounded-full bg-accent px-2 py-0.5 text-[0.55rem] font-bold tracking-wider whitespace-nowrap text-nuit uppercase">
                      ★ Recommandé pour vous
                    </span>
                  ) : null}
                  <span className="font-titre block text-lg leading-tight font-bold text-accent">
                    {jeu.nom}
                  </span>
                  <span className="block text-sm text-texte-doux">
                    {!jeu.pret
                      ? 'Bientôt disponible'
                      : (raison ?? jeu.accroche)}
                  </span>
                </span>
                <span className="shrink-0 text-xs text-texte-doux">
                  {jeu.minJoueurs}-{jeu.maxJoueurs}
                  <br />
                  joueurs
                </span>
              </button>
            </li>
          )
        })}
      </ul>

      <h2 className="font-titre pt-2 pb-2 text-sm font-semibold tracking-widest text-texte-doux uppercase">
        Packs premium
      </h2>
      <ul className="grid grid-cols-2 gap-3 pb-4">
        {PACKS_PREMIUM.map((pack) => (
          <li
            key={pack.id}
            className="rounded-3xl border-2 border-dashed border-trait bg-nuit-2 p-4 text-center opacity-80"
          >
            <span className="text-3xl" aria-hidden="true">
              {pack.emoji}
            </span>
            <span className="font-titre block pt-1 text-sm font-bold">
              {pack.nom}
            </span>
            <span className="block text-xs text-texte-doux">
              {pack.description}
            </span>
            <span className="mt-2 inline-block rounded-full bg-surface-2 px-2 py-1 text-[0.65rem] font-semibold">
              🔒 Bientôt disponible
            </span>
          </li>
        ))}
      </ul>
    </Cadre>
  )
}
