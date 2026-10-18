/* Behavior shared by the case study pages:
   chapter tiles in the hero, a sticky chapter bar with reading progress,
   and "peek" tiles that reveal their detail on hover or tap, then close again. */
(function () {
  const $$ = (s, r) => [...(r || document).querySelectorAll(s)];

  /* keep the sticky chapter bar just under the site header */
  const header = document.querySelector(".top");
  const setHH = () => document.documentElement.style.setProperty("--hh", (header ? header.offsetHeight : 66) + "px");
  setHH(); addEventListener("resize", setHH);

  /* chapter tiles in the hero, built from the chapter bar links */
  const links = $$("#toc a");
  const box = document.getElementById("chapters");
  if (box) {
    const tones = ["c-lilac", "c-mint", "c-peach", "c-sky", "c-rose", "c-butter"];
    box.innerHTML = links.map((a, i) =>
      `<a class="${tones[i % tones.length]}" href="${a.getAttribute("href")}"><i aria-hidden="true">↓</i>${a.textContent}</a>`).join("");
  }

  /* reading progress and active chapter */
  const toc = document.querySelector(".toc"), ol = document.getElementById("toc");
  const map = new Map(links.map((a) => [a.getAttribute("href").slice(1), a]));
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        links.forEach((a) => a.classList.remove("on"));
        const a = map.get(e.target.id);
        if (a) {
          a.classList.add("on");
          if (ol) ol.scrollTo({ left: a.offsetLeft - ol.clientWidth / 2 + a.clientWidth / 2, behavior: "smooth" });
        }
      });
    }, { rootMargin: "-30% 0px -60% 0px" });
    $$("article section").forEach((s) => io.observe(s));
  }
  const art = document.querySelector("article");
  function progress() {
    if (!art || !toc) return;
    const r = art.getBoundingClientRect();
    const p = Math.min(1, Math.max(0, (innerHeight * 0.3 - r.top) / (r.height - innerHeight * 0.3)));
    toc.style.setProperty("--p", p.toFixed(3));
  }
  addEventListener("scroll", progress, { passive: true }); progress();

  /* peek tiles: the front shows the label, hover or tap reveals the detail */
  const peekSel = [
    "#pains .grid .card",
    "#takeaways .grid .card",
    "body.theme-zomato #segments .grid.g4 .card",
    "body.theme-uber #segments .stages .card",
    "body.theme-uber #goal .grid.g3 .card"
  ].join(",");
  const tiles = [];
  $$(peekSel).forEach((card) => {
    const kids = [...card.children];
    const front = kids.filter((k) => k.matches(".tag, h3"));
    const rest = kids.filter((k) => !front.includes(k));
    if (!front.length || !rest.length) return;
    const back = document.createElement("div");
    back.className = "peek-back";
    front.forEach((k) => { const c = k.cloneNode(true); c.setAttribute("aria-hidden", "true"); back.appendChild(c); });
    rest.forEach((k) => back.appendChild(k));
    card.appendChild(back);
    card.classList.add("peek");
    card.tabIndex = 0;
    card.setAttribute("role", "button");
    card.setAttribute("aria-expanded", "false");
    tiles.push(card);
  });
  let timer;
  const close = (except) => tiles.forEach((t) => { if (t !== except) { t.classList.remove("open"); t.setAttribute("aria-expanded", "false"); } });
  const toggle = (t) => {
    const open = !t.classList.contains("open");
    close(t);
    t.classList.toggle("open", open);
    t.setAttribute("aria-expanded", String(open));
    clearTimeout(timer);
    if (open) timer = setTimeout(() => close(), 7000);
  };
  tiles.forEach((t) => {
    t.addEventListener("click", () => toggle(t));
    t.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); toggle(t); } if (e.key === "Escape") close(); });
    t.addEventListener("mouseleave", () => { t.classList.remove("open"); t.setAttribute("aria-expanded", "false"); });
  });
  document.addEventListener("click", (e) => { if (!e.target.closest(".peek")) close(); });
})();
