import { motion } from "framer-motion";

const sections = [
  {
    id: "getting-started",
    title: "Getting Started",
    body: "Lidqx lets users deposit PAS, receive yield-bearing gPAS, split exposure into PT and YT, and manage positions across fixed-yield and variable-yield strategies.",
    bullets: [
      "Vault Deposit: deposit PAS and mint gPAS.",
      "Yield Tokenisation: split gPAS into PT and YT.",
      "PT Strategy: lock fixed outcomes into maturity.",
      "YT Strategy: express a view on future yield.",
      "Yield Trading: rotate between PT and YT positions.",
    ],
  },
  {
    id: "stage-1",
    title: "Stage 1 - Vault Deposit",
    body: "Users deposit PAS to receive gPAS. gPAS is interest-bearing by exchange rate, not by balance rebasing. Your token amount stays constant while redemption value changes as exchange rate grows.",
    bullets: [
      "Deposit PAS -> receive gPAS at current exchange rate.",
      "Withdrawals redeem based on current exchange rate, not original deposit value.",
      "Yield is reflected in value-per-gPAS over time.",
    ],
  },
  {
    id: "stage-2",
    title: "Stage 2 - Yield Tokenisation",
    body: "gPAS can be split into PT and YT to separate principal and yield rights. This creates tradable components of one underlying position.",
    bullets: [
      "1 gPAS split -> 1 PT + 1 YT.",
      "Before maturity: PT and YT can be recombined into gPAS.",
      "At maturity: PT settles principal side, YT settles yield side under protocol rules.",
    ],
  },
  {
    id: "stage-3",
    title: "Stage 3 - PT Strategy",
    body: "PT is used for fixed-outcome positioning. PT commonly trades below 1 PAS equivalent before maturity, reflecting removal of floating yield rights.",
    bullets: [
      "Buy PT when fixed return implied by market pricing is attractive.",
      "Hold PT through maturity to realize principal-side settlement.",
      "PT can also be sold before maturity for active position management.",
    ],
  },
  {
    id: "stage-4",
    title: "Stage 4 - YT Strategy",
    body: "YT expresses a directional view on future yield. Traders pay upfront for yield exposure and profit when realized yield exceeds implied pricing.",
    bullets: [
      "YT valuation is driven by implied yield vs expected underlying yield.",
      "If expected yield > implied yield, YT may be underpriced.",
      "Maturity-gated claim policy prevents pre-maturity claim loops.",
    ],
  },
  {
    id: "stage-5",
    title: "Stage 5 - Yield Trading",
    body: "Advanced users can combine PT and YT positions for hedging, speculation, or inventory rotation based on yield market conditions.",
    bullets: [
      "PT-centric stance targets fixed outcomes.",
      "YT-centric stance targets yield upside.",
      "Active rotation can adapt risk/return profile over time.",
    ],
  },
  {
    id: "policy",
    title: "Reward Policy and Metrics",
    body: "The protocol currently operates with monthly epoch reward policy and a projected APR communication target.",
    bullets: [
      "Reward cadence: monthly epoch distribution.",
      "Projected APR: strategy target used for communication.",
      "Vault APY: realized result from actual exchange-rate updates.",
    ],
  },
];

const Guide = () => {
  return (
    <div className="min-h-screen bg-[#0b0c10] text-white font-saira">
      <div className="mx-auto max-w-6xl px-6 md:px-10 pt-14 pb-20">
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          className="rounded-2xl border border-white/10 bg-[#11131a] p-8 md:p-10"
        >
          <p className="text-xs uppercase tracking-[0.22em] text-white/55">Lidqx Documentation</p>
          <h1 className="mt-3 text-3xl md:text-4xl font-semibold leading-tight text-white">
            Protocol Documentation
          </h1>
        </motion.section>

        <div className="mt-8 grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-6">
          <aside className="lg:sticky lg:top-8 self-start rounded-xl border border-white/10 bg-[#11131a] p-4">
            <p className="px-2 pb-2 text-xs uppercase tracking-[0.2em] text-white/45">Contents</p>
            <nav className="space-y-1">
              {sections.map((section) => (
                <a
                  key={section.id}
                  href={`#${section.id}`}
                  className="block rounded-md px-3 py-2 text-sm text-white/70 hover:text-white hover:bg-white/5 transition"
                >
                  {section.title}
                </a>
              ))}
            </nav>
          </aside>

          <main className="space-y-4">
            {sections.map((section, idx) => (
              <motion.article
                key={section.id}
                id={section.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.28, delay: idx * 0.02, ease: "easeOut" }}
                className="rounded-xl border border-white/10 bg-[#11131a] p-6"
              >
                <h2 className="text-xl font-semibold text-white">{section.title}</h2>
                <p className="mt-2 text-sm md:text-base text-white/75 leading-relaxed">{section.body}</p>
                <ul className="mt-4 space-y-2">
                  {section.bullets.map((item) => (
                    <li key={item} className="flex items-start gap-3 text-sm text-white/80 leading-relaxed">
                      <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-white/60" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </motion.article>
            ))}

          </main>
        </div>
      </div>
    </div>
  );
};

export default Guide;
