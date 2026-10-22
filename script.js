// Odeslání formuláře.
// Nastavte WEBHOOK_URL na n8n webhook (POST, JSON). Bez něj se otevře e-mail klient (mailto) jako záloha.
const WEBHOOK_URL = "";
const FALLBACK_EMAIL = "alfaestate@alfaestate.cz";

const form = document.getElementById("lead-form");
const msg = document.getElementById("form-msg");

function show(text, ok) {
  msg.textContent = text;
  msg.className = "form-msg " + (ok ? "ok" : "err");
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const data = Object.fromEntries(new FormData(form));
  if (data.web) return; // honeypot

  let valid = true;
  form.querySelectorAll("[required]").forEach((el) => {
    const bad = el.type === "checkbox" ? !el.checked : !el.value.trim() || !el.checkValidity();
    el.classList.toggle("invalid", bad);
    if (bad) valid = false;
  });
  if (!valid) return show("Doplňte prosím označená pole a potvrďte souhlas.", false);

  delete data.web;
  data.zdroj = "pronajmy-zapad";
  data.odeslano = new Date().toISOString();

  if (WEBHOOK_URL) {
    try {
      const r = await fetch(WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!r.ok) throw new Error(r.status);
      form.reset();
      return show("Děkujeme! Nabídku jsme přijali a brzy se vám ozveme.", true);
    } catch (err) {
      return show("Odeslání se nepodařilo. Zavolejte prosím na 603 382 392.", false);
    }
  }

  const body = Object.entries(data)
    .filter(([k, v]) => v && k !== "souhlas" && k !== "odeslano" && k !== "zdroj")
    .map(([k, v]) => `${k}: ${v}`)
    .join("\n");
  location.href = `mailto:${FALLBACK_EMAIL}?subject=${encodeURIComponent("Nabídka pronájmu – web Pronájmy Západ")}&body=${encodeURIComponent(body)}`;
  show("Otevíráme váš e-mail. Odešlete zprávu a my se vám ozveme.", true);
});

form.addEventListener("input", (e) => e.target.classList.remove("invalid"));
