/* FE Feed — Topic metadata
 * Each topic gets a stable key, display name, accent color (category coding),
 * and a Lucide-style 24x24 stroke SVG path used in chips, the Topics grid, and Stats.
 * Colors are chosen for >=3:1 contrast against the dark surfaces.
 */
window.FE_TOPICS = [
  { key: "math",     name: "Mathematics",            short: "Math",      color: "#6366F1", icon: "M4 19V5m0 14h16M8 16l3-5 2 3 3-6" },
  { key: "prob",     name: "Probability & Statistics", short: "Prob/Stat", color: "#8B5CF6", icon: "M5 19V9m4 10V5m4 14v-7m4 7V11M3 21h18" },
  { key: "econ",     name: "Engineering Economics",  short: "Economics", color: "#10B981", icon: "M12 2v20M7 5h7a3 3 0 0 1 0 6H7m0 0h8a3 3 0 0 1 0 6H7" },
  { key: "ethics",   name: "Ethics & Professional Practice", short: "Ethics", color: "#14B8A6", icon: "M12 3l8 4v5c0 5-3.5 8-8 9-4.5-1-8-4-8-9V7l8-4z" },
  { key: "circuits", name: "Circuit Analysis",       short: "Circuits",  color: "#3B82F6", icon: "M4 7h4l2 10 2-14 2 8h4" },
  { key: "emag",     name: "Electromagnetics",       short: "E-Mag",     color: "#06B6D4", icon: "M12 3v4m0 10v4M5 8a7 7 0 0 0 0 8m14-8a7 7 0 0 1 0 8M8 9a4 4 0 0 0 0 6m8-6a4 4 0 0 1 0 6" },
  { key: "elec",     name: "Electronics",            short: "Electronics", color: "#0EA5E9", icon: "M9 3v4m6-4v4M9 17v4m6-4v4M6 7h12v10H6z" },
  { key: "power",    name: "Power",                  short: "Power",     color: "#F59E0B", icon: "M13 2L4 14h6l-1 8 9-12h-6l1-8z" },
  { key: "control",  name: "Control Systems",        short: "Control",   color: "#F43F5E", icon: "M3 12h4l2 6 4-14 2 8h6" },
  { key: "comm",     name: "Communications",         short: "Comms",     color: "#EC4899", icon: "M2 12a10 10 0 0 1 20 0M5.5 12a6.5 6.5 0 0 1 13 0M9 12a3 3 0 0 1 6 0m-3 0v9" },
  { key: "dsp",      name: "Signal Processing",      short: "DSP",       color: "#D946EF", icon: "M2 12c2 0 2-7 4-7s2 14 4 14 2-10 4-10 2 5 4 5 2-2 4-2" },
  { key: "linsys",   name: "Linear Systems",         short: "Lin Sys",   color: "#A855F7", icon: "M3 3v18h18M3 15l5-5 4 3 7-8" },
  { key: "digital",  name: "Digital Systems",        short: "Digital",   color: "#84CC16", icon: "M7 8V5h10v3M7 16v3h10v-3M4 8h16v8H4zM9 12h6" },
  { key: "networks", name: "Computer Networks",      short: "Networks",  color: "#2DD4BF", icon: "M5 5h4v4H5zm10 0h4v4h-4zM10 17h4v4h-4zM7 9v4h10V9M12 13v4" },
  { key: "compsys",  name: "Computer Systems",       short: "Comp Sys",  color: "#FB923C", icon: "M5 5h14v10H5zM9 19h6M12 15v4M8 9h2m4 0h2M8 12h8" },
  { key: "swe",      name: "Software Engineering",   short: "Software",  color: "#22C55E", icon: "M8 6l-5 6 5 6m8-12l5 6-5 6M14 4l-4 16" }
];
