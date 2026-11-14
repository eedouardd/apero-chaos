import { Bouton } from '../composants/Bouton'
import { Cadre } from '../composants/Cadre'
import { Logo } from '../composants/Logo'

interface Props {
  onNouvellePartie: () => void
  /** Fourni quand une nouvelle version de l'app est prête : la touche recharge la page. */
  onMettreAJour?: () => void
}

export function Accueil({ onNouvellePartie, onMettreAJour }: Props) {
  return (
    <Cadre
      pied={<Bouton onClick={onNouvellePartie}>Nouvelle partie</Bouton>}
    >
      {onMettreAJour ? (
        <div role="status">
          <button
            type="button"
            onClick={onMettreAJour}
            className="anim-apparition min-h-12 w-full rounded-2xl border-2 border-neon-cyan bg-surface-2 px-4 py-2 text-base font-semibold active:scale-[0.98]"
          >
            ✨ Nouvelle version prête. Touche pour actualiser.
          </button>
        </div>
      ) : null}
      <div className="anim-apparition flex flex-1 flex-col items-center justify-center gap-8 text-center">
        <Logo />
        <div>
          <p className="font-titre text-[2.6rem] leading-none font-black tracking-tight uppercase">
            <span className="texte-neon anim-neon block">Apéro</span>
            <span
              className="texte-neon block -rotate-3"
              style={{ '--accent': 'var(--color-neon-cyan)' } as React.CSSProperties}
            >
              Chaos
            </span>
          </p>
          <p className="mt-6 text-lg text-texte-doux">
            Un téléphone, des potes,
            <br />
            et plus aucune dignité.
          </p>
        </div>
      </div>
      <p className="pb-1 text-center text-xs text-texte-doux/70">
        L’abus d’alcool est dangereux pour la santé. Buvez avec modération,
        jamais avant de conduire.
      </p>
    </Cadre>
  )
}
