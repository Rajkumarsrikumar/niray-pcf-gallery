import CustomForm from "./CustomForm";
import Icon from "../Icon";

export const metadata = { title: "Request custom PCF development | Niray PCF Gallery", description: "Need a Power Apps code component that isn't in the gallery? Niray IT Solutions builds custom PCF controls for Canvas, Model-driven and Power Pages." };

const steps = [
  { icon: "doc", h: "Tell us what you need", b: "Describe the screen, the data and where it will run." },
  { icon: "layers", h: "Scope and quote", b: "We reply within 2 business days with a fixed scope and quote." },
  { icon: "bolt", h: "Build and test", b: "Built to the same standard as the gallery, with screenshots at every screen size." },
  { icon: "box", h: "Deliver", b: "Managed + unmanaged solution, source if agreed, and a user manual." },
];

export default function Custom() {
  return (
    <>
      <section className="canvas-dots border-b border-line">
        <div className="mx-auto max-w-7xl px-4 py-14">
                    <h1 className="mt-2 max-w-3xl text-4xl font-extrabold tracking-[-0.03em] text-ink sm:text-6xl">Can't find the component you need? We'll build it.</h1>
          <p className="mt-4 max-w-2xl text-lg text-ink-soft">Niray IT Solutions builds custom PCF controls for Canvas apps, Model-driven apps and Power Pages, or tailors an existing gallery component to your process.</p>
        </div>
      </section>
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 lg:grid-cols-[1fr_1.2fr]">
        <ol className="space-y-5">
          {steps.map((s, i) => (
            <li key={s.h} className="flex gap-4">
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-brand-sky text-brand-blue"><Icon name={s.icon} className="h-6 w-6" /></span>
              <div><p className="font-bold text-brand-navy">{i + 1}. {s.h}</p><p className="text-slate-600">{s.b}</p></div>
            </li>
          ))}
        </ol>
        <CustomForm />
      </div>
    </>
  );
}
