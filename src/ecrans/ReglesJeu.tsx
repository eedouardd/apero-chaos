import { Bouton } from '../composants/Bouton'
import { Cadre } from '../composants/Cadre'
import { reglesDuJeu, type DefinitionJeu } from '../jeux/catalogue'

interface Props {
  jeu: DefinitionJeu
  sansAlcool: boolean
  onCommencer: () => void
  onRetour: () => void
}

/** Règles du jeu, affichées avant de commencer. */
export function ReglesJeu({ jeu, sansAlcool, onCommencer, onRetour }: Props) {
  return (
    <Cadre
      titre="Les règles"
      onRetour={onRetour}
      couleur={jeu.couleur}
      pied={<Bouton onClick={onCommencer}>Commencer</Bouton>}
    >
      <div className="anim-apparition flex flex-1 flex-col gap-5">
        <div className="text-center">
          <span className="text-6xl" aria-hidden="true">
            {jeu.emoji}
          </span>
          <h2 className="font-titre texte-neon pt-2 text-3xl font-black uppercase">
            {jeu.nom}
          </h2>
        </div>
        <ol className="grid gap-3">
          {reglesDuJeu(jeu, sansAlcool).map((regle, index) => (
            <li
              key={regle}
              className="flex gap-3 rounded-2xl bg-surface p-4 text-lg"
            >
              <span className="font-titre grid size-8 shrink-0 place-items-center rounded-full bg-accent text-sm font-bold text-nuit">
                {index + 1}
              </span>
              <span>{regle}</span>
            </li>
          ))}
        </ol>
        {sansAlcool ? (
          <p className="rounded-2xl border-2 border-dashed border-accent/60 p-3 text-center text-base text-texte-doux">
            🧃 Mode sans alcool : les gages remplacent les gorgées.
          </p>
        ) : null}
      </div>
    </Cadre>
  )
}
