Sur l'iPhone Duo, le clavier utilise toute la largeur de l'écran dès qu'aucune caméra ni Dynamic Island ne le gêne.

<details>
<summary>Vue d'ensemble</summary>
<br>

**Duo fermé, en paysage, caméra à gauche**

1. `HingeStatusChangeModifier` lit la charnière : `.closed`.
2. `HingeRule` laisse `SizeClassRule` choisir le layout.
3. `SizeClassRule` renvoie `.unoccludedScreenEdges` : clavier jusqu'aux bords.
4. `ScreenOcclusionsModifier` lit la caméra : une occlusion à gauche.
5. `KeypadScreenEdgesModifier` étend le clavier à droite seulement.

→ Clavier à 14 pt du bord droit, safe area à gauche.

</details>

## Changements

<dl><dd><details>
<summary>Ajout de la détection de la posture du Duo (fermé, ouvert à plat) via la charnière, pour choisir le layout</summary>
<dl><dd><br>

**Avant** : `SizeClassRule` choisissait le layout avec les size classes seules.

**Maintenant** : `HingeRule` lit aussi la posture de la charnière.
- Si le Duo est ouvert à plat en paysage, le layout est Étendu.
- Sinon, `HingeRule` laisse `SizeClassRule` décider.

```swift
enum HingeStatus { // ouverture de l'écran d'un iPhone pliable
    case closed         // fermé, écran extérieur seul
    case partiallyOpen  // à moitié plié le long de la division
    case fullyOpen      // ouvert à plat
}

struct HingeRule: LayoutModeRule { // layout selon la posture, sinon les size classes
    private let fallback: any LayoutModeRule // décide pour les postures que la règle ignore
    func mode(for context: LayoutContext) -> KeypadLayoutMode { … }
    func keypadEdgeReach(in context: LayoutContext) -> KeypadEdgeReach { … }
}
```

**Appelants** : `LayoutContext` gagne `containerAxis`, `hingeStatus` et `divisionAxis`, donc chaque `.init` passe les trois. `ChosenModeRule` ne change pas de comportement.

```diff
- Self.letsUserChooseLayoutMode ? ChosenModeRule(chosenLayoutMode) : SizeClassRule()
+ Self.letsUserChooseLayoutMode ? ChosenModeRule(chosenLayoutMode) : HingeRule()
```

**Comment la posture arrive jusqu'à la règle**

- `HingeStatusChangeModifier` écoute `onHingeChange` et traduit le statut système en `HingeStatus`.
- `DivisionAxisChangeModifier` lit l'axe de la division<sup><a href="#user-content-division">1</a></sup> qui traverse la vue.
- `KeypadLayoutModifier` garde les deux en `@State` et reconstruit le `LayoutContext`.

<details>
<summary>🧩 <code>HingeRule.mode</code></summary>

```swift
struct HingeRule: LayoutModeRule {
    private let fallback: any LayoutModeRule // SizeClassRule par défaut

    func mode(for context: LayoutContext) -> KeypadLayoutMode {
        switch context.hingeStatus {
        case .fullyOpen where context.containerAxis == .horizontal:
            .wide // ouvert à plat en paysage : assez de place pour Étendu
        case .closed, .partiallyOpen, .fullyOpen, nil:
            fallback.mode(for: context) // fermé, plié, portrait ou sans charnière
        }
    }
}
```

**Lire** : [`KeypadLayoutModifier.body`](https://github.com/bpisano/RPN-Calculator/pull/70/files#diff-29e172a15b1be29a5d76916d2e534f07eb40c350b3007471e41ec6161371f6a7R41) → [`onHingeStatusChange`](https://github.com/bpisano/RPN-Calculator/pull/70/files#diff-29e172a15b1be29a5d76916d2e534f07eb40c350b3007471e41ec6161371f6a7R54) → [`HingeRule.mode`](https://github.com/bpisano/RPN-Calculator/pull/70/files#diff-b66d8724c570204aa201e0bfe2a3c106bc976f370125f2c1fcb41834167b2089R28)

</details>

</dd></dl>
</details></dd></dl>

<dl><dd><details>
<summary>Modification du clavier : 14 pt du bord de l'écran, sauf du côté où la caméra ou la Dynamic Island le croise</summary>
<dl><dd><br>

**Avant** : le clavier restait dans la safe area des deux côtés.

**Maintenant** : chaque `LayoutModeRule` dit jusqu'où le clavier s'étend, avec un `KeypadEdgeReach`.
- `safeArea` : le clavier reste dans la safe area.
- `screenEdges` : le clavier va jusqu'aux deux bords de l'écran.
- `unoccludedScreenEdges` : le clavier va jusqu'à chaque bord qu'aucune occlusion<sup><a href="#user-content-occlusion">2</a></sup> ne croise à sa hauteur.

**Appelants** : `LayoutModeRule` exige `keypadEdgeReach(in:)`, donc chaque règle l'implémente. `ChosenModeRule` renvoie `.safeArea`, comme avant.

**Quand la size class verticale est regular**

- `SizeClassRule` renvoie `.screenEdges`.
- Le clavier va à 14 pt du bord des deux côtés.

**Quand le téléphone est en paysage**

- `SizeClassRule` renvoie `.unoccludedScreenEdges`.
- `ScreenOcclusionsModifier` lit les occlusions de l'écran en `ScreenOcclusion` : un côté et une hauteur.
- Si une occlusion croise la hauteur du clavier, ce côté garde la safe area.
- Tant que les occlusions ne sont pas lues, les deux côtés gardent la safe area.

<details>
<summary>🧩 <code>KeypadEdgeReach.ignoredEdges</code></summary>

```swift
enum KeypadEdgeReach { // jusqu'où le clavier s'étend sur ses côtés
    func ignoredEdges(clearOf occlusions: [ScreenOcclusion]?, alongside keypadSpan: ClosedRange<CGFloat>?) -> Edge.Set {
        switch self {
        case .safeArea:
            [] // rien n'est ignoré
        case .screenEdges:
            .horizontal // les deux côtés
        case .unoccludedScreenEdges:
            // part des deux côtés, retire chaque côté où une occlusion croise le clavier
            // occlusions pas encore lues : aucun côté
            occlusions?
                .filter { occlusion in keypadSpan.map(occlusion.crosses) ?? false }
                .reduce(into: .horizontal) { edges, occlusion in edges.remove(occlusion.edge) } ?? []
        }
    }
}
```

**Lire** : [`SizeClassRule.keypadEdgeReach`](https://github.com/bpisano/RPN-Calculator/pull/70/files#diff-e877c1faf6c9e8e27c90053d82b82f129eb5feb7be6a8ed41c343001f49edbf7R20) → [`KeypadScreenEdgesModifier.body`](https://github.com/bpisano/RPN-Calculator/pull/70/files#diff-25d91ff96a737852c6710f20ad67d4e57679b06d05e3bd54899e5e31ede2b94aR25) → [`KeypadEdgeReach.ignoredEdges`](https://github.com/bpisano/RPN-Calculator/pull/70/files#diff-af8665817699abb9046afc65a978aef92209a860e4fa5a483ab6020410ef662fR25)

</details>

</dd></dl>
</details></dd></dl>

<dl><dd><details>
<summary>Modification du layout Étendu : status line posée sur le clavier, même écart qu'en Compact, alignée sur ses bords</summary>
<dl><dd><br>

**Avant** : la status line avait sa hauteur fixe et 8 pt de marge sous elle.

**Maintenant** : la status line prend les mêmes marges et les mêmes bords que le clavier.

<details>
<summary>🧩 <code>CalculatorView</code></summary>

```diff
- .frame(height: theme.metrics.xLineHeight)
- .padding(.bottom, Layout.statusBottomPadding)
+ .padding(.leading, margin)
+ .keypadScreenEdges(alongside: keypadSpan)
+ .padding(.trailing, margin)
```

**Lire** : [`CalculatorView`](https://github.com/bpisano/RPN-Calculator/pull/70/files#diff-fbe53bc2362eb74d4af4564f3638e6e16d522079da33380fb930be6b567ac669R81)

</details>

</dd></dl>
</details></dd></dl>

## Captures

| Avant | Après |
|---|---|
| <img src="https://github.com/user-attachments/assets/3700643a-348b-45bf-8b08-94e1c0ec048e" width="250" alt="Calculator screen iPhone paysage, Dynamic Island à gauche, avant"> | <img src="https://github.com/user-attachments/assets/69e7f1da-7e61-43d0-b900-67b908b13e46" width="250" alt="Calculator screen iPhone paysage, Dynamic Island à gauche, après"> |
| <img src="https://github.com/user-attachments/assets/629b5e0c-eaf4-41b6-9805-7905b81643a8" width="250" alt="Calculator screen iPhone paysage, Dynamic Island à droite, avant"> | <img src="https://github.com/user-attachments/assets/90750eaf-d8ab-404b-8a29-6c80e8a1343d" width="250" alt="Calculator screen iPhone paysage, Dynamic Island à droite, après"> |
| <img src="https://github.com/user-attachments/assets/2005f32d-0be3-4df1-b5bb-df62f3dbd51a" width="250" alt="Calculator screen Duo ouvert paysage, avant"> | <img src="https://github.com/user-attachments/assets/bb61f0cb-a617-4304-92bb-3d519180b989" width="250" alt="Calculator screen Duo ouvert paysage, après"> |
| <img src="https://github.com/user-attachments/assets/2e381fc6-7003-4291-973a-3b97c4137c77" width="250" alt="Calculator screen iPhone portrait, avant"> | <img src="https://github.com/user-attachments/assets/3dc7d4a3-3d63-4706-b5e9-596f9b9d05b4" width="250" alt="Calculator screen iPhone portrait, après"> |

## À tester
Lancement → écran Calculatrice

- [ ] Duo fermé, portrait : pas de saut au lancement, pager pleine largeur, Cos/Cosh invisibles
- [ ] Duo fermé, paysage caméra en haut à gauche : clavier à 14 pt du bord gauche
- [ ] Duo fermé, paysage caméra en bas à droite : comme avant
- [ ] Duo ouvert à plat, paysage : clavier Étendu à 14 pt des bords, status line alignée
- [ ] iPhone en paysage : côté sans Dynamic Island à 14 pt, s'inverse en tournant
- [ ] iPad et iPhone portrait : inchangés, hors écart status line ↔ clavier en Étendu

## Vocabulaire

<details>
<summary>2 termes</summary>

1. <a id="division"></a>**division** : zone réservée de l'écran où passe le pli d'un iPhone pliable. Lue par `DivisionAxisChangeModifier` via `reservedRegions(kind: .division)`.
2. <a id="occlusion"></a>**occlusion** : zone réservée de l'écran cachée par du matériel, caméra ou Dynamic Island. Lue par `ScreenOcclusionsModifier` via `reservedRegions(kind: .occlusion)`.

</details>

Closes #66
