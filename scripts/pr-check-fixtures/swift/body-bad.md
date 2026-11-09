Sur l'iPhone Duo, le clavier utilise toute la largeur de l'écran dès qu'aucune caméra ni Dynamic Island ne le gêne.

## Changements
- Ajout de la détection de la posture du Duo (fermé, ouvert à plat) via la charnière, pour choisir le layout
- Modification du clavier en size class verticale regular : 14 pt du bord de l'écran des deux côtés, au lieu de la safe area
- Modification du clavier en size class verticale compact (paysage) : 14 pt du bord de chaque côté que la caméra ou la Dynamic Island ne croise pas, safe area gardée de l'autre
- Modification du layout Étendu : status line posée sur le clavier, même écart qu'en Compact, alignée sur ses bords

## Captures

| Avant | Après |
|---|---|
| <img src="https://github.com/user-attachments/assets/3700643a-348b-45bf-8b08-94e1c0ec048e" width="250" alt="Calculator screen iPhone paysage, Dynamic Island à gauche, avant"> | <img src="https://github.com/user-attachments/assets/69e7f1da-7e61-43d0-b900-67b908b13e46" width="250" alt="Calculator screen iPhone paysage, Dynamic Island à gauche, après"> |
| <img src="https://github.com/user-attachments/assets/629b5e0c-eaf4-41b6-9805-7905b81643a8" width="250" alt="Calculator screen iPhone paysage, Dynamic Island à droite, avant"> | <img src="https://github.com/user-attachments/assets/90750eaf-d8ab-404b-8a29-6c80e8a1343d" width="250" alt="Calculator screen iPhone paysage, Dynamic Island à droite, après"> |
| <img src="https://github.com/user-attachments/assets/2005f32d-0be3-4df1-b5bb-df62f3dbd51a" width="250" alt="Calculator screen Duo ouvert paysage, avant"> | <img src="https://github.com/user-attachments/assets/bb61f0cb-a617-4304-92bb-3d519180b989" width="250" alt="Calculator screen Duo ouvert paysage, après"> |
| <img src="https://github.com/user-attachments/assets/2e381fc6-7003-4291-973a-3b97c4137c77" width="250" alt="Calculator screen iPhone portrait, avant"> | <img src="https://github.com/user-attachments/assets/3dc7d4a3-3d63-4706-b5e9-596f9b9d05b4" width="250" alt="Calculator screen iPhone portrait, après"> |

## À tester
- [ ] Duo fermé, portrait : pas de saut au lancement, pager pleine largeur, Cos/Cosh invisibles
- [ ] Duo fermé, paysage caméra en haut à gauche : clavier à 14 pt du bord gauche
- [ ] Duo fermé, paysage caméra en bas à droite : comme avant
- [ ] Duo ouvert à plat, paysage : clavier Étendu à 14 pt des bords, status line alignée
- [ ] iPhone en paysage : côté sans Dynamic Island à 14 pt, s'inverse en tournant
- [ ] iPad et iPhone portrait : inchangés, hors écart status line ↔ clavier en Étendu

Closes #66


