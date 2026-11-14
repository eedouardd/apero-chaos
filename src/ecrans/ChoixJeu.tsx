import { Cadre } from '../composants/Cadre'
import { jouerSon, vibrer } from '../effets/sons'
import {
  CATALOGUE,
  CATEGORIES,
  JEU_MES_CARTES,
  accrocheDuJeu,
} from '../jeux/catalogue'
import { PACKS_PREMIUM } from '../jeux/packs'
import { NB_CARTES_PERSO_MIN } from '../moteur/cartesPerso'
import { evaluerJeux, type JeuEvalue } from '../moteur/recommandations'
import type { IdJeu, Joueur } from '../types'

interface Props {
  joueurs: Joueur[]
  sansAlcool: boolean
  /** Résumé des réglages en cours (« Pimenté · Normal »), pour y revenir d'un toucher. */
  resumeReglages: string
  nbCartesPerso: number
  onChoisir: (id: IdJeu) => void
  onMesCartes: () => void
  onReglages: () => void
  onRetour: () => void
}

const CLASSE_TITRE =
  'font-titre sticky -top-3 z-10 -mx-5 bg-nuit/90 px-5 py-2 text-sm font-semibold tracking-widest text-texte uppercase backdrop-blur'

interface PropsTuile {
  evalue: JeuEvalue
  sansAlcool: boolean
  /** Grande tuile lumineuse pour les jeux recommandés. */
  enAvant: boolean
  onChoisir: (id: IdJeu) => void
}

function TuileJeu({ evalue, sansAlcool, enAvant, onChoisir }: PropsTuile) {
  const { jeu, jouable, raison } = evalue
  return (
    <button
      type="button"
      disabled={!jouable}
      onClick={() => {
        jouerSon('carte')
        vibrer()
        onChoisir(jeu.id)
      }}
      style={{ '--accent': jeu.couleur } as React.CSSProperties}
      className={`group flex w-full items-center gap-3 rounded-3xl border-2 bg-surface text-left transition-transform duration-150 active:scale-[0.97] ${
        enAvant ? 'lueur border-transparent p-4' : 'border-trait p-3'
      }`}
    >
      <span
        aria-hidden="true"
        className={`grid shrink-0 place-items-center rounded-2xl bg-accent/15 group-disabled:opacity-50 ${
          enAvant ? 'size-16 text-4xl' : 'size-12 text-3xl'
        }`}
      >
        {jeu.emoji}
      </span>
      <span className="min-w-0 flex-1">
        <span className="font-titre block text-lg leading-tight font-bold text-accent group-disabled:opacity-50">
          {jeu.nom}
        </span>
        {/* La raison reste bien lisible : c'est elle qui explique pourquoi le jeu est grisé. */}
        <span className={`block text-sm ${raison ? 'text-texte' : 'line-clamp-2 text-texte-doux'}`}>
          {raison ?? accrocheDuJeu(jeu, sansAlcool)}
        </span>
      </span>
      <span className="shrink-0 text-center text-sm text-texte-doux">
        {jeu.minJoueurs}-{jeu.maxJoueurs}
        <br />
        joueurs
      </span>
    </button>
  )
}

export function ChoixJeu({
  joueurs,
  sansAlcool,
  resumeReglages,
  nbCartesPerso,
  onChoisir,
  onMesCartes,
  onReglages,
  onRetour,
}: Props) {
  const jeux = evaluerJeux(
    CATALOGUE.filter((jeu) => jeu.pret),
    joueurs,
  )
  const recommandes = jeux.filter((evalue) => evalue.recommande)
  const sections = CATEGORIES.map((categorie) => ({
    ...categorie,
    jeux: jeux.filter((e) => !e.recommande && e.jeu.categorie === categorie.id),
  })).filter((section) => section.jeux.length > 0)
  const perso = evaluerJeux([JEU_MES_CARTES], joueurs)[0]
  const persoPret = nbCartesPerso >= NB_CARTES_PERSO_MIN

  return (
    <Cadre titre="Choisis ton jeu" onRetour={onRetour}>
      <button
        type="button"
        onClick={onReglages}
        className="mb-2 flex min-h-11 w-full items-center justify-between gap-2 rounded-2xl border-2 border-trait bg-surface-2 px-4 text-left text-sm active:scale-[0.98]"
      >
        <span className="min-w-0 truncate font-semibold">{resumeReglages}</span>
        <span className="shrink-0 text-texte-doux underline underline-offset-4">Modifier</span>
      </button>

      {recommandes.length > 0 ? (
        <section aria-labelledby="titre-pour-vous" className="pb-3">
          <h2 id="titre-pour-vous" className={CLASSE_TITRE}>
            ★ Pour vous ce soir
          </h2>
          <p className="pb-2 text-sm text-texte-doux">
            Selon vos {joueurs.length} joueurs et leurs limites.
          </p>
          <ul className="grid gap-3">
            {recommandes.map((evalue) => (
              <li key={evalue.jeu.id} className="anim-apparition">
                <TuileJeu evalue={evalue} sansAlcool={sansAlcool} enAvant onChoisir={onChoisir} />
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {sections.map((section) => (
        <section key={section.id} aria-labelledby={`titre-${section.id}`} className="pb-3">
          <h2 id={`titre-${section.id}`} className={CLASSE_TITRE}>
            {section.titre}
          </h2>
          <ul className="grid gap-2">
            {section.jeux.map((evalue) => (
              <li key={evalue.jeu.id}>
                <TuileJeu
                  evalue={evalue}
                  sansAlcool={sansAlcool}
                  enAvant={false}
                  onChoisir={onChoisir}
                />
              </li>
            ))}
          </ul>
        </section>
      ))}

      <section aria-labelledby="titre-perso" className="pb-3">
        <h2 id="titre-perso" className={CLASSE_TITRE}>
          Fait par vous
        </h2>
        <div
          style={{ '--accent': JEU_MES_CARTES.couleur } as React.CSSProperties}
          className="grid gap-2 rounded-3xl border-2 border-trait bg-surface p-3"
        >
          <button
            type="button"
            disabled={persoPret && !perso.jouable}
            onClick={() => {
              jouerSon('carte')
              vibrer()
              if (persoPret) onChoisir(JEU_MES_CARTES.id)
              else onMesCartes()
            }}
            className="flex w-full items-center gap-3 text-left active:scale-[0.98]"
          >
            <span
              aria-hidden="true"
              className="grid size-12 shrink-0 place-items-center rounded-2xl bg-accent/15 text-3xl"
            >
              {JEU_MES_CARTES.emoji}
            </span>
            <span className="min-w-0 flex-1">
              <span className="font-titre block text-lg leading-tight font-bold text-accent">
                {JEU_MES_CARTES.nom}
              </span>
              <span className="block text-sm text-texte-doux">
                {persoPret
                  ? `${nbCartesPerso} cartes · Touche pour jouer`
                  : nbCartesPerso === 0
                    ? 'Écris tes propres défis et questions.'
                    : `${nbCartesPerso} sur ${NB_CARTES_PERSO_MIN} cartes pour pouvoir jouer.`}
              </span>
            </span>
          </button>
          {persoPret ? (
            <button
              type="button"
              onClick={onMesCartes}
              className="min-h-11 rounded-2xl border-2 border-accent bg-accent/5 text-sm font-semibold text-accent active:scale-[0.98]"
            >
              Modifier mes cartes
            </button>
          ) : null}
        </div>
      </section>

      <p className="pt-1 pb-4 text-center text-sm text-texte-doux">
        🔒 Bientôt : {PACKS_PREMIUM.map((pack) => pack.nom).join(', ')}.
      </p>
    </Cadre>
  )
}
