# Five Nights at the Church ⛪

A fully playable 3D first-person horror game prototype inspired by *Five Nights at Freddy's*, reimagined in a **modern Catholic Church** and a **contemporary parish security office**, built with **Three.js** and modern WebGL.

---

## 📖 Lore & Setting

You have been hired as the nocturnal security specialist at the newly constructed **St. Jude Catholic Parish**. The facility is a masterpiece of contemporary sacred architecture: soaring ceilings, polished terrazzo flooring, a pristine white Carrara marble sanctuary altar, and minimalist blonde oak pews.

However, after midnight, the parish's consecrated sacred art stirs:
- **Our Lady of Sorrows (*Mater Dolorosa*)**: A smooth white Carrara marble statue of the weeping Virgin Mary / angel with dark tear tracks.
- **Sanctus Michael (*The Archangel / Saint*)**: An imposing modern white marble parish saint with a glowing golden halo disc and martyr's cross blade.
- **The Memorial Penitent (*The Columbarium Shroud*)**: A draped stone mourning figure from the parish columbarium that crawls through the building's galvanized HVAC air return ducting.

Bound by quantum locking, **they cannot move while directly observed on CCTV**. But as you switch feeds or when battery power drops, they advance across the modern narthex and ductwork toward your administration office.

---

## 🏢 Modern Office & Defenses

### Your Office Setup
- **Panoramic Desk View:** Drag mouse horizontally, move cursor towards screen edges, or press `A` / `D` (or arrow keys) to pan between the **Left Maglock Door (-45°)** and the **Right HVAC Duct (+45°)**.
- **Center Feature (Acoustic Plate Glass Window):** Floor-to-ceiling plate glass with black anodized aluminum storefront mullions overlooking the narthex hallway. Click **WINDOW SPOTLIGHT** to flash the ceiling track light and banish peeking statues.
- **West Exit (Commercial Security Door):**
  - Equipped with an **Electromagnetic Lock (Maglock)** and stainless steel panic push bar. Click **MAGLOCK DOOR** to seal and arm the door (red indicator LED).
  - Click **CORRIDOR LIGHT** to inspect the hallway outside the vision glass panel.
- **HVAC Air Return Duct (Right Crawlway):**
  - Heavy commercial HVAC return duct. Click **FIRE SHUTTER** to lower the motorized steel fire damper with an electric servo motor.
  - Click **DUCT LIGHT** to illuminate the interior ductwork.
- **Digital Surveillance System (CCTV):**
  - Modern widescreen LCD monitor sitting on your dark walnut executive desk.
  - Press **SPACEBAR**, click the monitor, or click the bottom trigger bar to toggle fullscreen feeds.

---

## 📹 Modern CCTV Surveillance Feeds

Switch between cameras via the interactive blueprint minimap or **Number Keys 1 - 5**:
1. **CAM 01 — Modern Sanctuary & Altar:** Minimalist white Carrara marble altar table, modern cross, and blonde oak pews. Starting point of **Our Lady of Sorrows**.
2. **CAM 02 — Memorial Columbarium:** Polished marble niche walls and brass memorial plaques. Starting point of the **Memorial Penitent**.
3. **CAM 03 — Reconciliation Chapel:** Modern post-Vatican II confession room with acoustic wood slatted privacy screen. Starting point of **Sanctus Michael**.
4. **CAM 04 — HVAC Return Air Duct:** Modern galvanized steel ductwork leading directly to your office.
5. **CAM 05 — Narthex & Office Corridor:** Modern parish hallway with structural columns and parish bulletin board directly outside your plate glass window.

---

## ⚡ Backup Battery & Facility Power
- You begin the night with **100% Backup Battery**.
- **Facility Drain (1 to 5 Bars):**
  - Base systems: 1 bar
  - Maglock Door engaged: +1 bar
  - Corridor Light active: +1 bar
  - HVAC Fire Shutter lowered: +1 bar
  - Duct Light active: +1 bar
  - CCTV Monitor active: +1 bar
  - Window Spotlight active: +1 bar
- **Facility Blackout:** At 0% power, the electronic magnetic lock disengages, lights cut out, the HVAC system falls silent, and church death bells toll as statues close in.

---

## 🚀 Running the Game

The local web server is running on **[http://localhost:3001/](http://localhost:3001/)**.

To start manually:
```bash
cd "c:\Game Project\five-nights-at-church"
node server.js
```
Or simply open `index.html` in any modern web browser.
