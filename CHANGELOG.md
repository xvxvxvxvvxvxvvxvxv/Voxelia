# Voxelia changelog – The Lost Kingdom

Every change to the game, newest first.
This English changelog starts with version 8.6. The full history of every earlier version, from the very first one, is
in Italian in [CHANGELOG.it.md](CHANGELOG.it.md) (in the game: switch the language to Italiano and open "What's new").

---

## 8.7 — Voxelia in English (November 12, 2026)

- **English is the default language.** Anyone opening the game for the first time finds it in English, and anyone who had it in Italian finds it in English once: you can switch back to Italian in Settings → General → Language, and from then on it stays the way you chose.
- **The translation comes in stages.** This first stage translates the menus, the settings, the interface (backpack, quests, journal, shops, windows, messages), Aldoria with its characters and their dialogue, Story Mode with its quests, cutscenes, the true ending and Thalassa, the Crown and the Album. Tomorrow, Voxelia Studio, combat, companions and the other parts come in the next stages: until then some text there stays in Italian.
- **Everything you see gets translated**: the text of windows and buttons, the tooltips that appear when you hover over things, field placeholders, the text drawn on the map (names above heads, signs), browser dialogs and the tab title. Even text the game puts together on the fly ("You defeated Frost Wolf!") is translated in full, names included.
- **What's new in your language.** In English the "What's new" window shows the English changelog (CHANGELOG.md); in Italian the complete changelog as always (now CHANGELOG.it.md).
- **The repository in English.** README.md, the list of previous versions (releases/LEGGIMI.md) and the changelog are in English; the Italian copies are README.it.md and CHANGELOG.it.md.
- **The Kingdom Threat and Act II (8.6) are translated too.**
- **For developers.** The game is still written in Italian: the new `src/lingua/` folder holds the language engine and the translations, one entry per Italian text exactly as it is in the code, with {0}, {1}… in place of the parts that change. The game's logic never sees the translation.

## 8.6 — The Kingdom Threat and the lost constellation (November 12, 2026)

Story Mode gets more demanding as you go on, and after the true ending there's a new chapter.

- **☠ The Kingdom Threat.** A level from 0 (Calm) to 10 (The Twilight), under the clock: tap it to read what each level does. It rises with the **story** (shards, Malakar, the true ending, the stars of Act II) and with the **days** spent with your hero (24 real minutes = one day, up to +4). It applies in the dungeons and open areas of the Story, not in town, interiors, Tomorrow, battles or the arena. On Easy difficulty it rises more slowly. When it goes up a level, an announcement says what changes.
- **Enemies learn new moves**, always telegraphed (dodge them with a roll):
  - from level 1 warriors raise their **guard** (a blue shield above their head: they parry almost everything, but two hits break the guard and leave them stunned with broken armor); archers and mages **back away** if you get close (they don't shoot while moving);
  - from 2 agile beasts **dodge** sideways from some of your hits;
  - from 3 the **charges** (a line of red circles, then the dash) and the **heavy blows** of big enemies (a red circle in front of them);
  - from 4 they attack more often; from 5 archers and mages fire **in a spread**; from 6 guard holds for three hits; from 7 **pack fury** (when an enemy falls, those nearby are enraged for five seconds);
  - at every level enemies have 2% more health and 1.5% more attack.
- **Champions have powers**, written above "★ Champion" (in the 3D view too) and in their name: **Shield** (a blue barrier to break first, recharges once), **Swift**, **Vampire** (near it you lose health and it regains it), **Explosive** (when it falls, get out of the red circle), **Summoner** (at half health it calls two reinforcements). One from level 1, two from 5, three from 9; in exchange they have a little less health and attack than a plain Champion. With the Threat a few more of them appear.
- **Tougher bosses**: the three phases from 7.44 remain, and the Threat adds the **Cross** (four lines of circles around the boss, from level 3, from the second phase), the **Ring** (circles all around you with a single gap, from 5, in the third phase) and the **Last Breath** (from 8: nearly defeated, the boss is immune for a moment and then unleashes Cross and explosion together).
- **🌙 Dangerous nights.** From level 2, at night, in the open areas (forest, desert, peaks, jungle, valley) more creatures come out of the dark, one or two at a time, more and more often.
- **⚔ Invasions.** From level 3, every two game days raiders attack a quarter of Aldoria (Harbor, East Fields or Noble Quarter). Under the clock you can see where and how much time is left (6 game hours). Three waves arrive in the quarter, the last with the Raider Captain (a Champion with powers). Repelled: gold, experience and a rare item. If time runs out the quarter is looted and for one day prices rise by 10%.
- **✦ Act II · The lost constellation**, after the true ending. The nights grow longer and three stars go out in the sky: the Lantern is missing from the charts, the constellation where Aldric the First imprisoned **Morvath, the Last Guardian**. King Malakar → Tolomeo the Astronomer → Stella on the Observatory dome, who opens the **Star Portal** to the **Twilight Valley**, a new area with dead trees, star crystals and rune-carved menhirs. There three new dungeons relight the three stars (you can see them shine again on the Valley's lanterns):
  - **The Well of Dead Stars** (level 18) and **Vesper, the Fallen Star**;
  - **The Eclipse Forge** (level 21) and **the Eclipse Colossus**;
  - **The Garden of the Upturned Moon** (level 24) and **Selene, the Moon Witch**;
  - with the three stars **Morvath's Keep** opens (level 24): at half health Morvath casts the **Eclipse** (the room goes dark and the shadows come).
  Eleven new creatures, four bosses with their unique item, three cutscenes. At the end: 15000 gold, the Dawnbringer's Blade, the Lantern Shield, the title **"Dawnbringer"**, and the Kingdom Threat drops by a level and a half. The chapter is followed in the quest list, with the "!" above whoever you need to find, and in the Chronicle.
- **Developer panel**: the **☠ Threat and Act II** tab (force the Threat, add days, spawn an enemy per role or a Champion with powers, night now, start/win/lose an invasion, every step of Act II, the new dungeons, the cutscenes); the four new bosses also in the 👑 Bosses tab.
- **Tests**: `tools/prova.js` tests the Threat (moves, Champions, bosses, nights, invasions) and Act II from start to finish. `tools/bilancia.js` also plays the new dungeons, and with `MINACCIA=5` it plays with the Threat fixed: the numbers were used to balance moves, powers and creatures.

---

Older versions (8.5 and earlier) are described in Italian in [CHANGELOG.it.md](CHANGELOG.it.md).
