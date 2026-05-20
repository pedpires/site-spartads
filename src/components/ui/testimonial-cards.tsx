import * as React from "react";
import { motion, type PanInfo } from "framer-motion";

type Position = "front" | "middle" | "back";

interface Testimonial {
  id: number;
  testimonial: string;
  author: string;
  role: string;
}

interface CardProps extends Testimonial {
  handleShuffle: () => void;
  position: Position;
}

function TestimonialCard({ handleShuffle, testimonial, position, author, role }: CardProps) {
  const isFront = position === "front";

  return (
    <motion.div
      style={{ zIndex: position === "front" ? 2 : position === "middle" ? 1 : 0 }}
      animate={{
        rotate: position === "front" ? "-5deg" : position === "middle" ? "0deg" : "5deg",
        x: position === "front" ? "0%" : position === "middle" ? "30%" : "60%",
      }}
      drag={isFront}
      dragElastic={0.35}
      dragConstraints={{ top: 0, left: 0, right: 0, bottom: 0 }}
      onDragEnd={(_: unknown, info: PanInfo) => {
        if (info.offset.x < -150) handleShuffle();
      }}
      transition={{ duration: 0.35 }}
      className={`absolute left-0 top-0 flex h-[400px] w-[300px] select-none flex-col rounded-2xl border border-[#1b2d45] bg-[#07152a] p-7 shadow-2xl ${
        isFront ? "cursor-grab active:cursor-grabbing" : ""
      }`}
    >
      <div className="flex gap-1 mb-6">
        {[0,1,2,3,4].map((i) => (
          <svg key={i} className="h-3.5 w-3.5 fill-[#007aff]" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
      </div>

      <p className="flex-1 text-[15px] leading-relaxed text-[#b7b9c2]">
        "{testimonial}"
      </p>

      <div className="mt-6 border-t border-white/5 pt-5 flex items-center gap-3">
        <div className="h-9 w-9 shrink-0 rounded-full bg-gradient-to-br from-[#007aff] to-[#005ec4] flex items-center justify-center text-sm font-semibold text-white">
          {author.charAt(0)}
        </div>
        <div>
          <div className="text-[13px] font-semibold text-white">{author}</div>
          <div className="text-[11px] text-[#3d99ff] mt-0.5">{role}</div>
        </div>
      </div>
    </motion.div>
  );
}

const TESTIMONIALS: Testimonial[] = [
  {
    id: 1,
    testimonial: "Disponibilidade, profissionalismo e preocupação em atingir os melhores resultados. Competentes e interessados em fazer o melhor trabalho possível. Acreditamos que seja uma parceria a manter — agradecemos por tudo!",
    author: "Cliente E-Commerce",
    role: "Parceria activa · Google & Meta Ads",
  },
  {
    id: 2,
    testimonial: "Temos tido a oportunidade de trabalhar com a SpartAds em campanhas de Google em áreas muito específicas. A agência tem demonstrado ser muito ágil e competente! Obrigada pelo apoio.",
    author: "Cliente B2B",
    role: "Campanhas Google Ads",
  },
  {
    id: 3,
    testimonial: "Em menos de 3 meses o nosso custo por lead caiu mais de 50% e o volume duplicou. A equipa percebe o nosso negócio e ajusta a estratégia sem precisarmos de pedir.",
    author: "Cliente Serviços",
    role: "Lead Generation · Meta Ads",
  },
];

export function ShuffleTestimonials() {
  const [positions, setPositions] = React.useState<Position[]>(["front", "middle", "back"]);

  const handleShuffle = () => {
    setPositions((prev) => {
      const next = [...prev];
      next.push(next.shift()!);
      return next as Position[];
    });
  };

  return (
    <div className="flex flex-col items-center gap-10">
      {/* Cards stack */}
      <div className="relative h-[400px] w-[300px]" style={{ marginLeft: "-90px" }}>
        {TESTIMONIALS.map((t, i) => (
          <TestimonialCard
            key={t.id}
            {...t}
            handleShuffle={handleShuffle}
            position={positions[i]}
          />
        ))}
      </div>

      {/* Drag hint */}
      <button
        onClick={handleShuffle}
        className="flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-[#7a8293] hover:text-white transition-colors"
      >
        <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M19 12H5M12 5l-7 7 7 7" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        Arraste ou clique para ver mais
      </button>
    </div>
  );
}
