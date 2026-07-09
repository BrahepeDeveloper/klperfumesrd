"use client";

import { useEffect, useRef, useState } from "react";
import { Users, Package, BadgeCheck, Clock } from "lucide-react";
import { motion, useInView } from "framer-motion";

function CountUp({ target, duration = 2 }: { target: number; duration?: number }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    const handleScroll = () => {
      if (hasAnimated.current || !ref.current) return;

      const element = ref.current;
      const rect = element.getBoundingClientRect();
      const isVisible = rect.top <= window.innerHeight && rect.bottom >= 0;

      if (isVisible) {
        hasAnimated.current = true;
        let timer: NodeJS.Timeout | null = null;
        const increment = target / (duration * 60);
        let current = 0;

        timer = setInterval(() => {
          current += increment;
          if (current >= target) {
            setCount(target);
            if (timer) clearInterval(timer);
          } else {
            setCount(Math.floor(current));
          }
        }, 1000 / 60);

        window.removeEventListener("scroll", handleScroll);
      }
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll(); // Check immediately in case element is already visible

    return () => window.removeEventListener("scroll", handleScroll);
  }, [target, duration]);

  return <div ref={ref}>{count.toLocaleString()}</div>;
}

const stats = [
  {
    value: 850,
    label: "Clientes satisfechos",
    icon: Users,
    color: "from-accent-blue to-accent-teal",
    featured: true,
  },
  {
    value: 3200,
    label: "Pedidos entregados",
    icon: Package,
    color: "from-accent-teal to-accent-blue",
  },
  {
    value: 100,
    label: "Marcas disponibles",
    icon: BadgeCheck,
    color: "from-accent-blue to-accent-teal",
  },
  {
    value: 3,
    label: "Años de experiencia",
    icon: Clock,
    color: "from-accent-teal to-accent-blue",
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
      delayChildren: 0.3,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.6,
      ease: "easeOut",
    },
  },
};

export default function ImpactSection() {
  const isInView = useInView({ once: true, margin: "-100px" });

  return (
    <section className="py-32 px-6 border-t border-border">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="text-center mb-20 space-y-4">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <span className="text-accent-blue text-sm font-medium uppercase tracking-widest">
              Nuestro Impacto
            </span>
          </motion.div>
          <motion.h2
            className="font-display text-5xl sm:text-6xl text-text-primary leading-tight"
            initial={{ opacity: 0, y: -20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            viewport={{ once: true }}
          >
            Números que hablan por nosotros
          </motion.h2>
          <motion.p
            className="text-text-secondary text-lg max-w-2xl mx-auto leading-relaxed"
            initial={{ opacity: 0, y: -20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
          >
            Cada cliente representa una historia de confianza. Estos números reflejan nuestro compromiso con la calidad, la autenticidad y el servicio.
          </motion.p>
        </div>

        {/* Stats Grid - Hierarchical Layout */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-8"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {/* Featured Card - Larger */}
          {stats[0] && (
            <motion.div
              variants={itemVariants}
              className="md:col-span-1 md:row-span-2"
            >
              <StatCard stat={stats[0]} featured />
            </motion.div>
          )}

          {/* Secondary Cards */}
          {stats.slice(1).map((stat, idx) => (
            <motion.div key={idx} variants={itemVariants}>
              <StatCard stat={stat} />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

function StatCard({
  stat,
  featured = false,
}: {
  stat: (typeof stats)[0];
  featured?: boolean;
}) {
  const Icon = stat.icon;

  return (
    <motion.div
      className={`group relative overflow-hidden rounded-2xl glass-effect p-8 transition-all duration-300 ${
        featured ? "h-full" : ""
      }`}
      whileHover={{
        scale: 1.03,
        boxShadow: "0 0 30px rgba(22, 200, 245, 0.3)",
      }}
      transition={{ duration: 0.3 }}
    >
      {/* Background Glow */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-accent-blue/20 to-transparent rounded-full blur-3xl" />
      </div>

      {/* Content */}
      <div className={`relative z-10 flex flex-col ${featured ? "h-full justify-between" : "gap-4"}`}>
        {/* Icon Circle */}
        <div className="inline-flex w-16 h-16 rounded-full bg-gradient-to-br from-accent-blue/10 to-accent-teal/10 items-center justify-center border border-accent-blue/20 group-hover:border-accent-teal/50 group-hover:glow-blue transition-all duration-300">
          <motion.div
            whileHover={{ scale: 1.1, rotate: 5 }}
            transition={{ duration: 0.3 }}
          >
            <Icon className="w-8 h-8 text-accent-blue group-hover:text-accent-teal transition-colors duration-300" />
          </motion.div>
        </div>

        {/* Number */}
        <div className={`${featured ? "" : ""}`}>
          <div
            className={`font-display bg-gradient-to-r ${stat.color} bg-clip-text text-transparent transition-all duration-300 group-hover:scale-105 origin-left ${
              featured ? "text-6xl sm:text-7xl" : "text-5xl"
            }`}
          >
            +<CountUp target={stat.value} />
          </div>
        </div>

        {/* Label */}
        <p className="text-text-secondary/80 text-sm group-hover:text-text-secondary transition-colors duration-300">
          {stat.label}
        </p>
      </div>

      {/* Border Animation on Hover */}
      <div className="absolute inset-0 rounded-2xl border border-border group-hover:border-accent-blue/50 transition-all duration-300 pointer-events-none" />
    </motion.div>
  );
}
