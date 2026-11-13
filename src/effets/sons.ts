// Sons courts fabriqués à la volée (Web Audio) et vibrations.
// Aucun fichier audio à charger : ça marche hors ligne et ça ne pèse rien.

export type NomSon = 'tap' | 'carte' | 'tic' | 'victoire' | 'explosion' | 'vote'

interface Note {
  frequence: number
  duree: number
  /** Décalage de départ en secondes. */
  debut: number
  forme: OscillatorType
  volume: number
}

const PARTITIONS: Record<NomSon, Note[]> = {
  tap: [{ frequence: 520, duree: 0.05, debut: 0, forme: 'triangle', volume: 0.15 }],
  carte: [
    { frequence: 340, duree: 0.07, debut: 0, forme: 'triangle', volume: 0.18 },
    { frequence: 680, duree: 0.1, debut: 0.06, forme: 'triangle', volume: 0.16 },
  ],
  tic: [{ frequence: 900, duree: 0.03, debut: 0, forme: 'square', volume: 0.07 }],
  vote: [
    { frequence: 440, duree: 0.09, debut: 0, forme: 'sine', volume: 0.2 },
  ],
  victoire: [
    { frequence: 523, duree: 0.1, debut: 0, forme: 'triangle', volume: 0.2 },
    { frequence: 659, duree: 0.1, debut: 0.1, forme: 'triangle', volume: 0.2 },
    { frequence: 784, duree: 0.1, debut: 0.2, forme: 'triangle', volume: 0.2 },
    { frequence: 1047, duree: 0.25, debut: 0.3, forme: 'triangle', volume: 0.22 },
  ],
  explosion: [
    { frequence: 160, duree: 0.5, debut: 0, forme: 'sawtooth', volume: 0.3 },
    { frequence: 70, duree: 0.7, debut: 0.05, forme: 'square', volume: 0.25 },
  ],
}

let contexte: AudioContext | null = null
let sonCoupe = false

export function definirSonCoupe(coupe: boolean): void {
  sonCoupe = coupe
}

function obtenirContexte(): AudioContext | null {
  if (typeof AudioContext === 'undefined') return null
  if (contexte === null) contexte = new AudioContext()
  // Les navigateurs mobiles mettent l'audio en pause tant qu'on n'a pas touché l'écran.
  if (contexte.state === 'suspended') void contexte.resume()
  return contexte
}

export function jouerSon(nom: NomSon): void {
  if (sonCoupe) return
  const audio = obtenirContexte()
  if (audio === null) return
  for (const note of PARTITIONS[nom]) {
    const depart = audio.currentTime + note.debut
    const oscillateur = audio.createOscillator()
    const gain = audio.createGain()
    oscillateur.type = note.forme
    oscillateur.frequency.setValueAtTime(note.frequence, depart)
    if (nom === 'explosion') {
      oscillateur.frequency.exponentialRampToValueAtTime(30, depart + note.duree)
    }
    gain.gain.setValueAtTime(note.volume, depart)
    gain.gain.exponentialRampToValueAtTime(0.001, depart + note.duree)
    oscillateur.connect(gain).connect(audio.destination)
    oscillateur.start(depart)
    oscillateur.stop(depart + note.duree + 0.02)
  }
}

/** Fait vibrer le téléphone s'il le permet (Android surtout ; l'iPhone l'ignore). */
export function vibrer(motif: number | number[] = 15): void {
  if (sonCoupe) return
  if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
    navigator.vibrate(motif)
  }
}
