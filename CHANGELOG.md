# Voxelia changelog – The Lost Kingdom

Every change to the game, newest first.
This English changelog has the full notes from version 8.6 on, and a short list of every earlier version at the end. The full history of every earlier version, from the very first one, is
in Italian in [CHANGELOG.it.md](CHANGELOG.it.md) (in the game: switch the language to Italiano and open "What's new").

---

## 8.15.7 — A new icon: the hero with the sword raised (November 27, 2026)

- **The game has a new icon.** The yellow and green cube in the browser tab is gone: in its place there's the hero with the default look (brown hair, blue tunic) raising the starting sword to the sky, with a burst of light at the tip, on a night-blue background with a gold frame. It's drawn with the game's own hero model, the same one you see when you play.
- **Everywhere.** The browser tab, the icon you get when you add the game to your phone's home screen, and the admin panel's tab. The full-size picture is in `docs/icona.png`.

---

## 8.15.6 — Maintenance: Tomorrow's contracts and names in English (November 26, 2026)

- **The contract board in English.** In the Open World and in Tomorrow, titles, steps, directions, relics, trophies and patrons stayed half in Italian ("Elimina Morva Sette Cicatrici · Meadows of Erethas (Goblin Arciere delle Ceneri, Campione: evocatore) · 2 regioni a sud-est"). Now it reads "Eliminate Morva Seven Scars · Meadows of Erethas (Goblin Archer of Ashes, Champion: summoner) · 2 regions to the south-east", and likewise "Bounty on…", "Recover the Codex of the First King · Crypt of Veyogor · floor 2", "Banner of Kroll Brokenfang", "The Keeper Guido". Out of 800 test contracts, nothing is left in Italian.
- **Tomorrow's names in English.** The regions' monsters ("Bandito delle Rovine" → "Bandit of the Ruins"), their leaders ("Re dei Goblin Itherax" → "Goblin King Itherax"), the dungeons ("Grotte di Aurolith" → "Caves of Aurolith") and the villagers ("Fabbro Bruno" → "Bruno the Smith", "Mercante ambulante Dino" → "Dino the Traveling Merchant") stayed in Italian, above their heads and in the texts.
- **Chimera items in English.** The names born from Borin's fusion ("Pugnale-falce della Chimera") now read "Dagger-scythe of the Chimera"; one epithet ("dell'Innesto") had no translation either.
- **Commissions in Italian.** The commission text said "il artiglio", "il amuleto" and "il zanna": now "l'artiglio", "l'amuleto" and "la zanna". Contracts already taken stay as they are.
- **Admin panel.** In English the world time read "Day 1, ore 08:10": now "Day 1, at 08:10".
- In Italian nothing else changes.

## 8.15.5 — Maintenance: the world events in English (November 25, 2026)

- **World events in the quarters.** In English, when a dragon, a meteor or a rare merchant came to East Aldoria or North Aldoria, the notice and the sign at the top of the screen stayed half in Italian ("☄ A meteor fell on Aldoria Est · Fields and Crafts · 11:01", "🐉 A dragon attacks Aldoria Nord · Quartiere Nobile · 11:01"): the quarter's name contains a "·" and was split in two. Now they read "☄ A meteor fell on East Aldoria · Fields and Trades · 11:01" and "North Aldoria · Noble Quarter".
- **Fields and Trades.** A few messages (the server's, the admin panel's and a treasure hint) called the quarter "Fields and Crafts": now it's always "Fields and Trades", as on the map.
- In Italian nothing changes.

## 8.15.4 — Maintenance: the Voxeliaverse's creatures and chests (November 24, 2026)

- **Creatures and chests out of reach in the realities.** In realities with canyons and spires, a creature or a chest sometimes appeared in a hollow closed off by rocks: the chest couldn't be opened and the creature couldn't be hit (out of 400 realities tried, 38 creatures and 10 chests). Now they appear only where you can walk to from the center of the island. The realities' shape, their names and saved realities don't change, and there are as many creatures as before.
- **For developers.** "Test all zones" in the developer panel always reported Aldoria East's Fields (cows and sheep "not reachable"): the large pasture is closed on purpose. Now grazing animals don't count, as already in the check the game makes when it builds the zones.

## 8.15.3 — Maintenance: the notes and inscriptions in English (November 21, 2026)

- **The Eye's doors.** In English, the stone door under Old Aldoria and the door of the Eye in the castle crypt stayed in Italian ("Una lastra di pietra nera, liscia come vetro…", "Sotto, incise in lettere antiche:", "«La verità sarà nei tuoi occhi, a tempo debito.»"). These texts go to a new line in the middle, and the English sentences ending with ” weren't split like the Italian ones ending with », so the lines couldn't be found. Now the sentences are split after ” too, and the lines that stop on a colon have their own translation.
- **The signed notes.** The castle's secret notes signed under the text ("«…» — M.", "— Il Ciambellano") showed the last sentence in Italian ("…Evacuate the quarter, I beg you. Se non mi ascolterai, la spezzerò io stesso.”") and the Chamberlain's signature untranslated. Now quote and signature are translated line by line.
- **The texts with a part that changes at the end** (the seventh heart of the Crown, the Crown Reunited ending) are now also split sentence by sentence, and a sentence quoted between «» is found without the quote marks too: the Council's minutes ("«Il Consiglio approva all'unanimità…»") are now all in English.
- **The Eldorian grammar and the cell wall.** The lines "«turmsi» — il re", "«lahig» — nasconde", "«uoi» — ciò che sta sotto" now read "“turmsi” — the king", "“lahig” — hides", "“uoi” — what lies beneath".
- **Voxelia Studio's example world.** The Flowermead sign's last lines ("Al Municipio: la Sindaca Ortensia.", "(Si raccomanda di non dare da mangiare agli slime.)") are now in English.
- In Italian nothing changes.

## 8.15.2 — Maintenance: the dungeon cycle, the notices in English and the developer panel (November 20, 2026)

- **"Cycle NaN".** The message "Dungeon complete! Next time you enter it will be reborn, stronger (cycle …)" appears about three seconds after the boss falls: if by then you were already in another zone (after Malakar, or in Act II, where the story takes you to the castle) it read "cycle NaN". Now the number is taken when the boss falls.
- **The notices with a symbol, in English.** With cutscene effects turned off, the notices whose title starts with a symbol kept the title in Italian ("🌙 Una notte pericolosa — With the Kingdom Threat…", and so "🏠 La tua casa", "🥚 Un uovo misterioso", "⛏ La miniera" and the others). Now title and text are both in English.
- **Tomorrow's regions in English.** The names of the regions read half in Italian ("Boschi di Thalagor", "Prati di Orgor"): now "Woods of Thalagor", "Meadows of Orgor", "Dunes of…", "Peaks of…", "Ash wastes of…".
- **The 3D view.** The descriptions for screen readers of the two buttons that turn the camera stayed in Italian: now "Turn the camera left/right".
- **For developers.** After playing Tomorrow, the developer panel of a Story game also listed the Tomorrow regions already visited (more than 200): they can't be loaded without a Tomorrow hero, so teleporting there and "Test all zones" ended in an error ("Cannot read properties of undefined (reading 'ch')"). Now they're listed only in Tomorrow. `tools/prova.js` now also fails when a zone of the test throws an error, not only when it writes one in the console.
- In Italian only the first and the last points change.

## 8.15.1 — Maintenance: the Crown's gems, the field battle and the Essences in English (November 19, 2026)

- **The Crown's gems.** With cutscene effects turned off, the notice of a splinter found came out half in Italian ("Rubino della Corona — Splinters gathered: 1/6…"): "Ruby/Diamond/Emerald/Amethyst/Topaz of the Crown" and the whole sentence were missing. Now it reads "Ruby of the Crown — Splinters gathered: 1/6 · see them in the Crown Album".
- **The gem buttons in the menu.** The tooltip over the Emerald, the Amethyst, the Diamond and the seventh gem stayed in Italian ("Ametista: Parco giochi", "Senza colore: Dietro la Corona"): now "Amethyst: Playground", "Colorless: Behind the Crown" and so on.
- **Ryan's field battle.** The tooltip over the troop buttons ("Arcieri: Tirano da lontano…"), the white flag ("Abbandona la battaglia") and the "rifornimenti" label stayed in Italian although names and descriptions were translated.
- **The Essences.** The tooltip over each Essence in the backpack ("Essenza di fuoco") now reads "Fire essence", for all nine elements.
- **For developers.** In `tools/prova.js` the Kingdom Threat step sometimes failed by chance ("mosse nuove mancanti"): an enemy's charge starts only 55% of the time, and in the test's 50 seconds there could be a single chance. Now during the test the wait between charges is reset until a charge has been seen (14 runs out of 14 passed; before, 3 out of 6 failed). The game doesn't change.
- In Italian nothing changes.

## 8.15 — The Voxeliaverse in the normal game (November 17, 2026)

- **The room behind the Crown is a zone of the game.** You enter it as before from the menu's Crown (the seventh gem) or right after the seventh fragment's cutscene, but now it's a room like those of Aldoria: the isometric view (or the game's 3D view), the Story hero moving with a click or the keyboard. Inside there are the fireplace with the armchair and the rug, the library up to the ceiling with the ladder and the glowing books, the round window with the stars, the seventh fragment on its pedestal, the table with the open book (a note from Vael), the candles and the door that takes you back to the menu.
- **The realities are zones of the game.** Each reality is an island floating in the sky, generated from its number as before, in the game's graphics: scattered hills, rock terraces, craters full of liquid, very tall spires or canyons with ridges; trees, crystals, giant mushrooms, corals or boulders in the reality's colors; the still sea, the sky by day, at sunset, at night or with a sun of another color. You fight with the game's combat (action or classic), with your weapons, potions and the map.
- **The creatures** still have completely random names and their reality's colors: the leaping ball, the charging beast, the giant, the eye that shoots from afar; the guardian is a real boss, with its bar and its ground slam. They grow with the hero's level and the reality's danger.
- **The mystery stays the same.** Three obelisks with a beam of light, each guarded by its creatures; once the three signs are read the guardian wakes, and behind it is the Heart (gold for the hero). After the guardian the reality can be saved and found again as it was; the purple door asks before you leave without saving. If you die in a reality you wake in the room, without losing anything. Paths from the center to the door and the signs (with bridges over the liquid) mean you can always reach everything.
- **The separate 3D engine is gone** (`src/voxeliaverse/8zzzzv_motore.js`): the realities' gravity no longer exists (in the isometric view you don't jump). Realities already saved in the library remain, with the same name.
- **For developers.** `8zzzzw_stanza.js` and `8zzzzx_realta.js` rewritten for the game's engine (zones `vx2stanza` and `vxr:<seed>`). The Voxeliaverse step of `tools/prova.js` enters from the Crown, tests the room and the library, checks that in one reality per land shape the signs and the Heart can be reached, then reads the signs, defeats the guardian, saves, takes the Heart, goes back, dies and forgets.

## 8.14 — Cutscenes in the classic style, the prologue remade and the test game (November 17, 2026)

- **The drawn-scene filter is gone.** Cutscenes no longer go through the pixel-art picture with the white text box and the "blips": they play full screen, in the game's voxel graphics, with the cinema bars and the text below. The option in the settings is gone.
- **The color washes are gone.** No more sepia on memories or purple halo on visions: a scene's light is that of its place and time.
- **The prologue shot again from scratch.** Eleven new scenes and a new text, all in the game's real places and with its characters: Aldoria's square in the morning, the First King and the Crown of Voxel in the throne room, the two brothers as children, Malakar at night before the Crown, the flight from the old quarter on the night of the fog, the six splinters crossing the sky above the castle and falling in the woods, in the sands of Khem and among the ice, the walled-up gate, and the hero arriving in the city by the southern road. The music is still the prologue's three tracks.
- **No references to other games.** Removed the two Voxelia Dimension cutscenes (the mode has been gone since 8.4) and the title phrase that quoted another game.
- **🧪 Test game in the developer panel.** A new tab, the first one: choose the difficulty, level, gold, potions, story phase, shards already found, the legendary weapon, invincibility, the combat (action or classic) and the starting zone, and start. Three ready-made starts: "New hero", "Mid story", "End of the game". It's a separate game: it isn't saved and doesn't touch the real save. With the test running, from the same tab you can heal the hero, change zone, start again with the same choices or close it.
- **For developers.** Removed `src/sistemi/8zzs_disegnate.js`; the new file is `src/storia/8zzzzzs_filmati814.js`. The other story cutscenes still have their previous scenes (without the filter and the washes): they will be shot again in the following updates.

## 8.13 — More reactive combat: it moves, you can feel it, and enemies warn you (November 16, 2026)

Action combat responds at once, you can see it move and feel when a blow connects; and enemies no longer strike without warning. Weapons, moves and damage are the same as before.

- **Presses are never lost.** Before, pressing during the first third of a move didn't count: anyone pressing quickly felt the game wasn't responding. Now a press at any point books the next move.
- **The blow lands earlier.** At about a third of the move instead of halfway (with the sword after 0.12 seconds instead of 0.17); heavy weapons stay a bit slower.
- **The tail of the move is skipped.** Once the blow has landed, if you've already pressed the next move starts at once; if you move, you walk. With the sword, hits in 1.6 seconds go from 5 to 6.
- **The perfect strike needs the right moment.** The +30% comes if you press after the blow has landed; mashing no longer gives it (before, it came almost by itself).
- **The roll starts as soon as you press Shift**, not when you release it; keep holding it and you run as before.
- **The lunge.** With every blow the hero takes a real, smooth step forward (before it was a jump of a few pixels), longer on the third blow; he stops in front of the enemy instead of passing through it.
- **You can feel the blow.** When it connects the game freezes for a few hundredths of a second (longer on the third blow and strong blows), the enemy turns white and slides back (before it jumped), sparks fly the way of the blow and the view gives a small jolt; the roll and the lunge raise dust.
- **The third blow of the chain makes normal enemies stagger** for a moment (bosses don't).
- **Always facing the enemy.** In combat the hero looks at the enemy he's fighting even while walking sideways or backwards: the one locked with Tab; otherwise the last one he hit or the one attacking him (even from behind); otherwise the nearest one on him. While striking he looks where the blow goes, while rolling or running he looks where he's going.
- **Enemies warn before striking.** Before, an enemy did damage the very instant it decided to strike, and dodging was pure luck. Now it stops, a red "!" appears above it and a red circle on the ground fills up in half a second (a bit less for bosses): when it's full it strikes. If you've left the circle it misses, if you're rolling you dodge it. The rhythm of its attacks stays the same, and an enemy that staggers loses the attack it was preparing.
- **Perfect dodge and counterattack.** If the roll starts at the very last moment (less than three tenths of a second before the blow) time slows down for a moment and your next blow is a counterattack with twice the strength.
- It all applies to action combat; anyone who chose classic combat in the settings finds it as it was. The effects (freeze, slow motion, jolt) follow the cinematic effects option.
- **For developers.** The new file `src/combattimento/8zzzzzr_reattivo.js`; in `src/base/5_game.js` a nearby enemy's blow goes through `rxWind()`. `tools/prova.js` has a new step that tests the chain, the roll, facing the enemy, the warning, the perfect dodge and the counterattack.

## 8.12.3 — Maintenance: Master Dino, the smith's goods and other texts in English (November 16, 2026)

- **Master Dino's techniques.** In his window the description of the four techniques (Dragon Palm, Tornado Kick, Shadow Step, Tiger Breath) stayed in Italian, in capitals, even though the translation was there: the line is shown between «», and the language engine couldn't find it with the quotes. Now a line between «» whose text has a translation is shown in English between “ ”.
- **Borin's daily goods.** The sets in the smith's window ("Spada del Grifone", "Elmo dell'Orso (epico)"…) had Italian names: now they're "Griffin Sword", "Bear Helmet (epic)" and so on, for all nine sets and the four pieces, also in the backpack once bought.
- **The Crafts Workshop hints.** The tooltip over each ingredient ("Wheat: Aldoria's Fields (east), or at the Market stall") stayed in Italian although both parts were translated.
- **Smaller texts:** the Dog's and the Penguin's descriptions in the Pet Shop ("Trova monete e, a volte, an item"), "From days passed (0 giorni)" in the Kingdom Threat window, and the labels of the Crown's gem buttons for screen readers ("Previous gem", "Next gem").
- In Italian nothing changes.

---

## 8.12.2 — Maintenance: item names and characters in English (November 15, 2026)

- **Weapons and armor found in the world have English names.** Steel, Rune and Dragon gear (every rare, epic and legendary item found at random) kept its Italian name in English: "Pugnale delle Rune", "Cotta di maglia d'Acciaio". Now it's "Rune Dagger", "Steel Chainmail", "Dragon Sword", in the backpack, the shops and the messages ("Collected: Rune Dagger +2").
- **Upgraded items too.** A name followed by its upgrade or mastery ("Sword +2", "Troll's Club +1 ★3") stayed in Italian even for common items: now it's translated, with the number kept.
- **The comparison in the backpack.** The line "Compared to …" under an item, with the attack, defense and HP differences, and the tooltip of the backpack bar ("3 of 24 items") were in Italian.
- **Ten lines of dialogue** from characters of Aldoria (the Royal Guard, Gerald, the croupier, Stefano the Mad Horse, the archivist and others) had no translation and appeared in Italian.
- **Sentences with an optional ending.** Some texts with a part that is sometimes empty (for example "…and retire them." in the companions window, or "Sold 7 items") stayed in Italian when that part was missing.

---

## 8.12.1 — Maintenance: the admin panel's Rooms tab and log (November 14, 2026)

- **No more "undefined" in the Rooms tab.** The admin panel didn't know the name of the Jade Temple (a dungeon since 7.48): in every room its cycle box was labelled "undefined", and a player inside it was shown as "tempio48@2" in the Players list. Now it says "Jade Temple" like the other dungeons.
- **The log and the floors in English.** With the panel in English, many log lines stayed in Italian or came out half and half ("Anna joined nella stanza prova"): logins, bans, kicks, mutes, announcements, worlds, leaderboard, rooms, plugins and server start. Now they're in English, and so are the dungeon floors in the Players list ("Forgotten Crypt · floor 2") and the cycle boxes' labels for screen readers. In Italian nothing changes.

---

## 8.12 — Voxelia in English, the last stage: Voxelia Studio, the server and the admin panel (November 13, 2026)

The English translation is complete: every part of the game now speaks English by default, and Italian stays one click away in Settings.

- **Voxelia Studio** (about 1,500 texts, in `src/lingua/9f_en_studio.js`): the editor and all its tools, terrains, walls, decorations and buildings, characters with their looks, moves and dialogue, enemies, items, doors, event zones and their actions, quests, variables, the music composer, cutscenes, the world check, the guide, the example world «The Valley of Flowermead», and the community worlds: browser, world pages, reviews, comments, favorites, reports, publishing with previews and video.
- **The server's messages** (about 1,000 texts, in `src/lingua/9g_en_server.js`): what the server and its plugins write to players (joins and leaves, trades, bans, publishing, parties, factions, houses, the flea market, the mayor, tournaments, the treasure hunt, bounties, fishing contests, teleport requests, mail and friends…) is translated when it reaches the game, so the server keeps working the same. System messages in the chat log are translated too; what players write stays as it is.
- **The admin panel** is in English, with a 🌐 button at the bottom right to switch to Italian (the choice stays in that browser). The plugin descriptions and their commands are translated too.
- **The English changelog** now ends with a list of every earlier version, from 1.0 to 8.5, with its title in English; the full notes of those versions stay in Italian in `CHANGELOG.it.md`.
- **Tooltips and hints** on drawing canvases and in text boxes are translated as well, and the "What's new" window has its title and Close button in English.

Still in Italian: the separate web pages of some plugins (the Roll of adventurers, the boss, tournament, speedrun and treasure pages…) and the server's console log, which only the server owner sees.

---

## 8.11 — Voxelia in English, stage 2: Tomorrow, the 3D view and the Voxeliaverse (November 13, 2026)

The third stage of the English translation. About 1,600 new texts, in `src/lingua/9e_en_tomorrow.js`:

- **Tomorrow**: the opening cutscene (the reset of the universe), the contracts with their clients, witnesses and targets, the factions and reputation, the world map, camps, shrines, teleport gems and Travel Stones, the battles for the cities.
- **Your kingdom**: conquest and banners, settlements and the ledger, buildings, the town editor (buildings, roads, walls, decorations, blocks), houses to furnish with their storage, the mine and the historical relics, the barracks and the army, happiness, jobs, taxes and protests, seasons and weather, caravans, player factions with roles and permissions, wars and sieges, the quest board.
- **Unique items**: names, affixes and powers, the stories of where they were forged, the heirlooms of Aldoria.
- **The 3D view and VR**: options, resolution and sharpening, the pause menu, the headset controls.
- **The Voxeliaverse** (8.9), which already spoke English on its own, now also follows the language engine.

Italian and Eldorian don't change. Still to come: Voxelia Studio, and then the server and the older changelog entries.

---

## 8.10 — Voxelia in English, stage 1: the game's systems and combat (November 13, 2026)

The second stage of the English translation (the first, in 8.7, covered menus, interface and Story Mode). About 1,400 new texts, in `src/lingua/9d_en_sistemi.js`:

- **Combat**: the moves of every weapon and their descriptions, charged hits, stamina, target lock, boss phases and weak points, the levers of the dungeons, curses, named legendary weapons and their special moves, elemental infusion, chimera items.
- **Companions and creatures**: taming and the stable, the Breeding Pens, crossbreeding and variants, the Menagerie (upgrade, customize, change shape, retirement, chimera eggs), pets, horses and horse races.
- **Crafts and pastimes**: the Crafts Workshop (cooking, alchemy, forging, tempering, smelting, the recipe book and experiments), the card table with its players, the Discovery Journal, world events (dragons, meteors, the rare merchant), digging and secret caves, the Crown Tower and its blessings, the weekly rankings, photo mode and the gallery, the house with its board and trophy shelf.
- **Everything else in the systems**: the music and the radio, previous versions, exporting and importing a hero, the overwrite warnings, the splash phrases under the title, and the developer panel.

Italian and Eldorian don't change. What's still in Italian (Tomorrow, Voxelia Studio, the drawn graphics, the server) comes with the next stages.

---

## 8.9.2 — Dialogue lines in the right language from the first letter (November 13, 2026)

- **The line is written straight in your language.** In English the dialogue window wrote the line letter by letter in Italian and turned it into English only at the end; in Eldorian every piece already written was translated on its own, so the words changed while the line was being written. Now the whole line is translated before the first letter, and the page's translator no longer touches it.
- **The cursor follows the letters.** The blinking cursor stood at the end of the part of the line not yet shown, often far to the right of the text (in Eldorian even more, because the hidden part was still the Italian one). Now it sits right after the last letter written.

---

## 8.9.1 — Dialogue lines without stray code (November 13, 2026)

- **The characters' lines no longer show `<span>`.** Since 8.8 every line in the dialogue window was written with the code around it: `«<span>The Library keeps the pages of Malakar's diary.</span>»`, and in Eldorian `«<ven>…</ven>»` (the Eldorian alphabet translated the code too). The window that writes the line letter by letter now takes the text alone, in Italian, English and Eldorian, for ordinary lines and for the answers to the questions.

---

## 8.9 — The seventh fragment and the Voxeliaverse (November 13, 2026)

The Heart of the Crown no longer ends with a battle: it ends with a door. Behind it there's a new game, made with a new 3D engine, and realities no one has ever counted.

- **💎 The Heart of the Crown, remade.** No more waves and no more boss fight against the Echo: the Echo is now your guide. The Heart is a golden square floating in the void, in a violet fog, with drifting cubes and stones and six walkways toward **six puzzle rooms**, one per splinter: the **Ruby** (fire: seven braziers, lighting one also changes its neighbors), the **Diamond** (truth: three rows of identical bridges, only one per row holds, and the Diamond shows them for a few seconds), the **Emerald** (time: a bridge that comes back in time and crumbles behind you), the **Amethyst** (building: three blocks to place over the void, only one path works), the **Topaz** (travel: six islands and twelve portals) and the **Sapphire** (memory: sequences of 4, 6 and 8 columns).
- **Hard, with help.** Falling into the void takes you back to the room's entrance; after three mistakes in the same room the Echo gives a hint. The puzzles are done once: what you solve stays solved.
- **The seventh fragment.** With the six rooms solved, the Founders' fragment, the one from the legends, opens in the middle: the cutscene "The world comes apart", 20,000 gold, the Reunited Crown and plenty of experience. And then the room behind the Crown.
- **The seventh gem.** On the menu's Crown a colorless gem appears, on the small point between the Diamond and the Ruby: turn the Crown there to enter the room.
- **🧊 A new 3D engine.** The room and the realities aren't the game's 3D view: they're a separate engine, with real voxels in three dimensions (you climb, jump, and there are floors above and below), corner shading, soft shadows from the sun or the moon, up to eight flickering lights, distance fog and glows. The hero is yours, with your gear, in third person: WASD to walk, Space to jump, the mouse to look around, E to use, and on phones a joystick with buttons.
- **The room behind the Crown.** A lit fireplace with the armchair and the rug, a library up to the ceiling with its ladder, a round window where you see the Crown turning among the stars, the seventh fragment on its pedestal and an open book with a note from Vael.
- **🌌 The realities.** Every reality is born from a number, and everything comes from that number: completely random names (the reality, its people, its founder, its creatures, its guardian), an island floating in the void (hills, terraces, craters, spires or canyons, with a still sea or without), trees, crystals, giant mushrooms, corals or boulders, the sky (day, sunset, night or a sun of another color), up to three moons and the gravity (in some you fall slowly, in others everything weighs more). Its nickname comes from what makes it strange: "the reality where you fall slowly", "of the three moons".
- **The fireplace and the library.** The fireplace takes you to an unknown reality, new on every journey and more dangerous; the library has glowing books, each one a reality with its name and its danger, and "Look for another book" always finds more.
- **The mystery.** Three beams of light are the three signs, each guarded by its creatures: once all three are read (they tell the story of that reality's people, and sometimes name Vael or a crown with seven points), the guardian wakes in the middle of the island. Defeat it and take the Heart of the reality: gold for your hero and the reality unveiled. At the top there's always the objective, with a compass and the distance.
- **⚔ Combat.** Click or J to strike with the sword (the hero turns toward the nearest enemy on its own), three hits in a row make the strong one; Shift, Q or right click to roll, and you can't be hit while rolling (hold Shift to run afterwards). Four kinds of creatures: the ball that leaps at you, the charging beast, the giant that crushes the ground, the flying eye that shoots; before they strike they glow or draw a red circle on the ground. The guardian has three attacks (the wide blow, the circles under your feet, the volley) and at half health it calls its kin. Health bars above enemies, hit numbers, green orbs that heal; fall into the void and you're brought back.
- **💾 Saving a reality.** When the guardian falls the game asks whether to save the reality (and asks again at the door if you leave without): it stays at the top of the library and when you go back you find it as you left it, with the signs read and the guardian defeated. Taking the Heart saves it on its own; from the library you can also forget it.
- **Act II fix (8.8):** the chains of the Buried didn't show, because they were drawn with the night lights, which indoor places don't have; now they show.
- **For developers.** New files: `src/corona/8zzzzu_cuore89.js` (the Heart and the seventh fragment) and the `src/voxeliaverse/` folder with `8zzzzv_motore.js` (the engine), `8zzzzw_stanza.js` (the room and the seventh gem) and `8zzzzx_realta.js` (the realities). `tools/prova.js` enters the Heart and checks the rooms, then opens the room behind the Crown and a reality: it strikes, dodges, reads the signs, defeats the guardian, saves the reality and goes back to it.

## 8.8 — Act II rewritten: The Buried City, and the six splinters of the Crown (November 13, 2026)

Act II is no longer "The Lost Constellation": it has been rewritten from scratch, with a new place, new bosses and a longer story, full of dialogue.

- **📜 The story.** After the true ending Aldoria shakes every night, always at the same hour, and the dry well of Old Aldoria caves in on a staircase. King Malakar sends you to his brother Aldric, the deposed King, in the prisons: he knows the Song of Kings, the lullaby handed down to the children of kings, which names a city no book remembers. Beneath the well lies **Eldora**, the city of scribes and builders that existed before Aldoria. There you meet **Oriana**, a cartographer from the Library who came down first, and **Vael**, the last scribe, a ghost who has been writing names on the dust for a thousand years. Vael tells the truth: the Eye hungered for names, and to seal it Aldric the First, then Prefect of the Guard, erased Eldora's names and buried the city with all its people, then built Aldoria on top and called himself the First King.
- **The three Keepers.** Bound to the seal and now awake, each at the bottom of their own dungeon (three floors, new creatures, their own style): **Brunilde, the Bell Founder** (the Bell Foundry: tolls in rings of circles, bronze automatons, armored at half health), **Ysolde, the Queen no one remembers** (the Hanging Gardens: roots under your feet, and twice she splits into mirror copies that vanish at the first hit), **Orsolo, the Keeper of Names** (the Archive of Names: erasures that chase you, and ink shades that protect him until you defeat them). They speak during the fight and, once freed, tell you who they were.
- **The Stone King.** With the three Keepers free the doors of the Buried Palace open. On the throne, Aldric the First speaks to you before the fight; then three phases: cave-ins, the stone crown (immune for a moment, with his guards), and in the last one the Buried of Eldora hold him with chains of light: he slows down and takes 40% more damage.
- **The ending.** A cutscene for the dawn of Eldora, then King Malakar: 18,000 gold, 9,000 experience, the Blade of Memory, the Crown of Eldora, the title "Keeper of Memory" and the **Sapphire**.
- **Dialogue.** Every step has its own scene, and King Malakar, Aldric, Oriana and Vael have new questions that open up as the story goes on (one appears only after you've read all the stones). Every Keeper and the Stone King have their own words before, during and after the fight.
- **Eldora** is a whole city: the square with the faceless statue and the braziers, the Foundry with fallen bells and anvils, the Gardens with moon pools, roots hanging from the stone sky and glowing mushrooms, the colonnaded Archive, the walled Palace, the houses, and Oriana's camp by the stairs. Underground it's always night: you see only the lights of the mushrooms, the braziers and the fire. To come and go there are the well stairs and the Kings' Passage, which leads straight to the castle prisons.
- **The twelve Memory Stones**, scattered around the city, tell Eldora's story in fragments; reading them all gives 3,000 gold, 1,500 experience and the title "Reader of Eldora".
- **💎 The six splinters of the Crown.** The Crown's splinters are now six: the **Sapphire** comes back, the gem broken since 8.4. "It broke when a city was forgotten": it becomes whole again when you finish Act II. On the menu Crown it shows whole from then on and leads to the Story; the Album and the Heart of the Crown count six (the Heart opens with all six).
- **The seventh.** Of a seventh light, colorless, the game speaks only in legends: in the Song of Kings, on an ancient stone in Eldora, in one of Vael's answers, and in a glimmer inside the Heart of the Crown. It doesn't appear anywhere else.
- **Who had played the old Act II** starts this new one from the beginning (an announcement says so); the title "Dawnbringer" stays.
- **Also:** in the questions to the characters, in English, the answers between « » were translated only halfway (the first and last sentences stayed in Italian); now they're translated in full, in the old questions too, and so are the lines the characters say when you approach them.
- **For developers.** Act II's text sits next to its English in `src/storia/8zzzzs_atto2.js` (`T88(italian, english)`), registered by `src/lingua/9c_en_atto2.js`. The developer panel tab "☠ Threat and Act II" has the new steps, the Keepers, the stones, the dungeons and the cutscenes; the Bosses tab has the four new bosses. The automatic test (`tools/prova.js`) plays the new Act II from start to finish, Keepers' phases included, and checks that every text has its English.

## 8.7.2 — The gates, fixed: nothing inside the walls, leaves that swing whole (November 13, 2026)

- **The gates no longer sink into the walls.** The two posts of every gate stood astride two tiles, half inside the towers of the walls; above the opening the walls drew a full stone lintel, and the leaves passed right through it; the decorations of the districts (the hedges of the Noble Quarter, the haystacks of the Fields, the planters of Thalassa, the ash of the Cinder Borough) stood on the line of the walls, inside the wall blocks. Now every gate is built on the tiles: the opening is made of whole tiles and the two pillars stand each in the middle of the wall tile next to the opening (in town, in place of the little towers). The walls draw nothing more in the pillars' tiles or above the opening: the lintel is the gate's own.
- **The pillars.** They take the color of the zone's walls (or of the gate, where the walls are trees or hedges), are one tile wide along the wall and a little thicker than the wall, and carry the crown of the district's gate on top (gold for the nobles, straw for the Fields, coal and embers for the Cinder Borough…).
- **The leaves swing on their hinges.** Before, every plank was a straight block moved along an arc: halfway open the leaf broke into a staircase of loose planks, and fully open it became a comb of planks set crosswise. Now the hinge is on the inner side of the pillar and the leaf is cut into many small pieces that follow its angle: halfway it stays one whole leaf, and open it's a thin leaf resting against the pillar at 90 degrees. Planks, bars, crossbars and iron straps stay in place on the leaf while it turns. In the classic view, the leaf that opens away from you is drawn behind the pillars and the one that comes toward you in front: you no longer see it pass over the pillar.
- **The decorations in front of the pillar.** Hedges, haystacks, planters and ash now stand in front of the pillar, on the district's side, on a free tile that becomes an obstacle (the hero no longer walks through a haystack); where that tile isn't free (a lamp, a house, a person) they're left out.
- **Everywhere.** The seven gates of Aldoria, the gates back to town from the Noble Quarter, the Fields, the Cinder Borough, the Port, the Forest, the Desert and the Peaks, Thalassa and the Emerald Jungle. The chains and padlock of the barred gate stay between the pillars, on the district's side.
- **Voxelia Studio.** The gate you place adapts to the passage you put it in: the opening is its tile plus the free tiles beside it (one per side at most, so 1, 2 or 3 tiles wide) and the pillars go in the tiles just outside, in place of the wall. It no longer sinks into the walls next to it the way the gates did when they were always three tiles wide.
- **For developers.** `gateGeo()` gives the pillars, the opening and the decoration tiles of a gate; `gateFit()` prepares them once per zone (when it loads). The automatic test (`tools/prova.js`) has a new step: in every zone, at five openings, no piece of a gate may end up inside a wall, a house or an object, the leaves never enter the pillars, and the tile in front of the opening stays reachable.

## 8.7.1 — Maintenance: page language, dates and numbers in English (November 12, 2026)

- **The page now says which language it's in.** It always declared itself Italian, even in English: screen readers read the English text with an Italian voice and the browser offered to "translate from Italian" a page that was already in English (and translating it would mix up the game's text). Now it follows the language chosen in Settings.
- **Dates, times and gold in the English format.** In English the dates were still written the Italian way, so "12/11/2026" on the Continue button read as December 11, and "43.210 gold" in the overwrite warning looked like 43 coins. Now in English they follow the browser's format (11/12/2026, 43,210); in Italian nothing changes. This applies to the menu, the overwrite warning, photos, the Album, the Crown, houses, factions, Voxelia Studio and the developer panel.

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

## Earlier versions, in brief

Every version from 1.0 to 8.5, newest first, with its title in English. The full notes for each one are in Italian in [CHANGELOG.it.md](CHANGELOG.it.md); [releases/LEGGIMI.md](releases/LEGGIMI.md) has a one-line English summary of every published build.

- **8.5** — The developer panel tests everything (November 10, 2026)
- **8.4** — Story and Tomorrow at the center (November 10, 2026)
- **8.3.2** — Maintenance: campfires no longer block passages (November 10, 2026)
- **8.3.1** — Maintenance: Tomorrow's Champions and the price line (November 6, 2026)
- **8.3** — Difficulty that grows with you (November 5, 2026)
- **8.2** — Aldoria 3026: beyond the sky (November 5, 2026)
- **8.1** — Order, tests and balance (November 5, 2026)
- **8.0** — The Crown Reunited (November 5, 2026)
- **7.57.1** — Maintenance: Aldoria 3026 quests no longer close by themselves (November 5, 2026)
- **7.57** — Aldoria 3026, the Chronogate and modes that unlock (November 5, 2026)
- **7.56** — Aldoria 2026: the modern city in the Sapphire (November 5, 2026)
- **7.55** — The Menagerie, elements, chimeras and dungeons as another dimension; the Sapphire has shattered (November 5, 2026)
- **7.54.2** — Animals and companions no longer get in the way (November 5, 2026)
- **7.54.1** — The menu fits the window, labels no longer cover windows, the horse faces where you face (November 5, 2026)
- **7.54** — Companions online, in trades and with variants; the Tower out of the way; the hero no longer walks by itself (November 4, 2026)
- **7.53** — General optimization: the game arrives compressed, less dead code, tidier sources, a check before publishing (November 4, 2026)
- **7.52.2** — The left arrow works like the right one (November 4, 2026)
- **7.52.1** — Nightmare heroes keep permanent death (November 4, 2026)
- **7.52** — Exporting and importing the hero (November 4, 2026)
- **7.51** — Thalassa and the jungle remade, glowing signs, running dust, diving and the ship removed, many bugs fixed (November 4, 2026)
- **7.50.1** — Maintenance: the lighthouse tablet, the shipyard counter, loose earth within reach (November 3, 2026)
- **7.50** — Two confirmations before deleting a game (October 30, 2026)
- **7.49.2** — Maintenance: really one meal at a time, the jester explained properly (October 30, 2026)
- **7.49.1** — Maintenance: the Tower without dead ends, the complete list of versions (October 29, 2026)
- **7.49** — The finishing touches: character cards, new models, the real Tower, the Crafts Workshop, a richer Thalassa, livelier animals (October 29, 2026)
- **7.48** — Story and study: choices that change the story, the quest board, the kingdom beyond the sea, the weekly rankings (October 29, 2026)
- **7.47** — Life: crafts, the house, photo mode, animals, cards, crossbreeding (October 29, 2026)
- **7.46** — The world: horses, your ship and the islands, timed events, the discovery journal, diving (October 29, 2026)
- **7.45** — Tomorrow: faction wars, caravans, citizens, weather and seasons, blocks (October 28, 2026)
- **7.44.1** — Maintenance: you leave the Tower in front of the door (October 28, 2026)
- **7.44** — Combat and dungeons: bosses in phases, levers, curses, named weapons, the Tower and the shovel (October 28, 2026)
- **7.43** — Previous versions, to replay (October 28, 2026)
- **7.42.3** — The developer panel, on servers, only for admins (October 28, 2026)
- **7.42.2** — Zero stamina really leaves you out of breath (October 28, 2026)
- **7.42.1** — Clicking a distant enemy makes the hero walk (October 28, 2026)
- **7.42** — The Voxel Crown, drawn scenes and the 3D view fixed (October 27, 2026)
- **7.41.1** — Maintenance: you leave the dungeon next to the entrance (October 27, 2026)
- **7.41** — Everyone sees the same enemies, the city in order and the walls on the border (October 26, 2026)
- **7.40** — The developer panel does everything (October 25, 2026)
- **7.39** — Player factions: building together (October 25, 2026)
- **7.38** — The portal after the boss, music of your choice, detailed maps and the Breeding Pens (October 25, 2026)
- **7.37.1** — Maintenance of the town, the army and your house (October 24, 2026)
- **7.37** — Smoother, and the graphics the way you want (October 23, 2026)
- **7.36** — The Travel Stone (October 23, 2026)
- **7.35** — Wood and the growing city (October 23, 2026)
- **7.34** — Your cities (October 23, 2026)
- **7.33** — Your house and the town walls (October 23, 2026)
- **7.32** — Action combat (October 23, 2026)
- **7.31** — The mines (October 23, 2026)
- **7.30** — The barracks and the army (October 23, 2026)
- **7.29** — The editor with every material (October 23, 2026)
- **7.28** — Running the town (October 23, 2026)
- **7.27.1** — Virtual reality keeps up with the new combat (October 23, 2026)
- **7.27** — The voxel-style 3D view (October 23, 2026)
- **7.26** — The town editor (October 23, 2026)
- **7.25** — The new prologue (October 23, 2026)
- **7.24** — Villages and cities built with sense (October 23, 2026)
- **7.23** — The reset of the universe (October 23, 2026)
- **7.22** — Wars (October 22, 2026)
- **7.21** — Your kingdom (October 22, 2026)
- **7.20** — Taming monsters (October 22, 2026)
- **7.19.1** — The passage between regions (October 22, 2026)
- **7.19** — Weapon moves (October 22, 2026)
- **7.18** — A single world (October 22, 2026)
- **7.17.1** — Tomorrow maintenance (October 22, 2026)
- **7.17** — Tomorrow comes alive (October 22, 2026)
- **7.16** — Tomorrow (October 22, 2026)
- **7.15** — The 3D view (October 22, 2026)
- **7.14** — The Open World and Aldoria's new music (October 22, 2026)
- **7.13.3** — Maintenance: the example plugin's command (October 21, 2026)
- **7.13.2** — Outlines in place and straight axes in VR (October 21, 2026)
- **7.13.1** — Doors can also be crossed in the headset (October 21, 2026)
- **7.13** — Voxelia in virtual reality: Meta Quest 3 (October 20, 2026)
- **7.12.1** — Gatherables in view again (October 20, 2026)
- **7.12** — Bigger biomes, the real Colosseum, the area map and the memory of Old Aldoria (October 15, 2026)
- **7.11.1** — Clickable links in chat (October 14, 2026)
- **7.11** — A harder kingdom, the five-phase Abomination and every cutscene remade (October 14, 2026)
- **7.10** — Real weapons in hand, a tune for every building and a bug hunt (October 13, 2026)
- **7.9.4** — Ryan's battles: you can leave again (October 12, 2026)
- **7.9.3** — Touch controls adapted to every device (October 11, 2026)
- **7.9.2** — Joystick aligned to the finger (October 11, 2026)
- **7.9.1** — Customizable touch controls (October 11, 2026)
- **7.9** — Controls for phones and tablets (October 11, 2026)
- **7.8.2** — Longer server messages (October 10, 2026)
- **7.8.1** — Portal after the boss, answers in dialogue and a single icon for everything (October 10, 2026)
- **7.8** — Voxel icons everywhere and Voxelia-style Community worlds (October 10, 2026)
- **7.7** — Community worlds, story scenes and developer mode (October 9, 2026)
- **7.6** — A more professional Voxelia Studio (October 9, 2026)
- **7.5** — Voxelia Studio (October 9, 2026)
- **7.4.1** — Guidelines in the HUD (October 9, 2026)
- **7.4** — Lighter graphics (October 9, 2026)
- **7.3.2** — Whole characters and the crypt unlocked (October 9, 2026)
- **7.3.1** — Big bug check (October 9, 2026)
- **7.3** — Unique characters, the Filly and the battlefields (October 9, 2026)
- **7.2** — Animations, new enemies and a tougher kingdom (October 8, 2026)
- **7.1** — The true ending (October 8, 2026)
- **7.0** — The living city, the castle's secrets and new music (October 8, 2026)
- **6.10** — New map, zoom and dark theme (October 8, 2026)
- **6.9** — Settings split by category (October 8, 2026)
- **6.8.1** — The cog stops (October 8, 2026)
- **6.8** — Touch-ups to the action wheel (October 8, 2026)
- **6.7** — Server plugins (October 8, 2026)
- **6.6** — Old Aldoria (October 8, 2026)
- **6.5** — The map of Aldoria, dreams and languages (October 8, 2026)
- **6.4** — Storm, hold and martial arts (October 8, 2026)
- **6.3** — Voxelia Dimension (October 7, 2026)
- **6.2** — Weapons that grow, bosses with powers, dungeons with campfires (October 7, 2026)
- **6.1** — Gates that open and the seaweed well (October 7, 2026)
- **6.0** — Unique dungeons, naval battles and the prologue (October 7, 2026)
- **5.3** — Server plugins (October 8, 2026)
- **5.2** — A bigger Aldoria, a hero who turns, unique furniture (October 7, 2026)
- **5.1** — Every building can be explored, the Harbor remade (October 7, 2026)
- **5.0** — The quarters of Aldoria (October 7, 2026)
- **4.7.2** — New start menu (October 7, 2026)
- **4.7.1** — FPS limit and V-Sync (October 7, 2026)
- **4.7** — Day and night, clock, compass, new icons, scenes, hero appearance and custom HUD (October 7, 2026)
- **4.6** — New backpack, WASD, cursor, sky and Ultra graphics (October 7, 2026)
- **4.5** — Dodge, lunge, casino and daily prices (October 7, 2026)
- **4.4** — Admin panel (October 7, 2026)
- **4.3** — Player list and ping (October 7, 2026)
- **4.2** — Player profiles (October 7, 2026)
- **4.1** — Chat log (October 7, 2026)
- **4.0** — Arena, dungeons, city and story (October 7, 2026)
- **3.0** — A server to play from different Wi-Fi networks
- **2.1** — Multiplayer fix
- **2.0** — Multiplayer and animated menu
- **1.0** — First version

