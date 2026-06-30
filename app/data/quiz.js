/* FE Feed — Quiz bank
 * Hand-authored conceptual / theory questions for the FE Electrical & Computer exam.
 * These test understanding and reasoning, not just recall — they complement the
 * formula-memorization questions the app auto-generates from the card deck.
 *
 * Fields: id, t (topic key), q (question), opts (array of choices), why (teaching note).
 * CONVENTION: opts[0] is ALWAYS the correct answer. The app shuffles the choices
 * at runtime, so author order here is just for clarity.
 */
window.FE_QUIZ = [
  /* ───────── Mathematics ───────── */
  { id:"q-math-disc", t:"math", q:"A quadratic ax²+bx+c=0 has discriminant b²−4ac < 0. What does this tell you about its roots?",
    opts:[
      "They are a complex-conjugate pair (no real roots)",
      "There is one repeated real root",
      "There are two distinct real roots",
      "The equation has no solutions at all"],
    why:"The discriminant sits under the square root. Negative → an imaginary part appears, giving two complex-conjugate roots that never cross the real axis." },
  { id:"q-math-dot", t:"math", q:"Two nonzero vectors have a dot product of exactly zero. What must be true?",
    opts:[
      "They are perpendicular (orthogonal)",
      "They are parallel",
      "They have equal magnitude",
      "One points opposite the other"],
    why:"A·B = |A||B|cosθ. With nonzero magnitudes, a zero result forces cosθ = 0, i.e. θ = 90°." },
  { id:"q-math-sing", t:"math", q:"When is a square matrix singular (has no inverse)?",
    opts:[
      "When its determinant equals zero",
      "When it is not symmetric",
      "When it contains negative entries",
      "When its trace is zero"],
    why:"The inverse formula divides by the determinant. det = 0 means the rows are linearly dependent and no inverse exists." },
  { id:"q-math-lhop", t:"math", q:"L'Hôpital's rule can be applied directly only when a limit has which form?",
    opts:[
      "An indeterminate form such as 0/0 or ∞/∞",
      "Any limit evaluated at infinity",
      "A limit that already equals a finite number",
      "Only limits of polynomial functions"],
    why:"You must first have an indeterminate quotient. Applying it to a determinate limit changes the answer." },
  { id:"q-math-eig", t:"math", q:"Eigenvalues of a matrix A are found by solving which equation?",
    opts:[
      "det(A − λI) = 0",
      "det(A) = λ",
      "A·λ = I",
      "trace(A) = λ"],
    why:"Av = λv rearranges to (A − λI)v = 0. A nonzero v exists only when det(A − λI) = 0 — the characteristic equation." },

  /* ───────── Probability & Statistics ───────── */
  { id:"q-prob-n1", t:"prob", q:"A sample standard deviation divides by n−1 instead of n. Why?",
    opts:[
      "It removes bias when estimating the population spread from a sample",
      "It makes the result larger as a safety margin",
      "Because one data point is always thrown away",
      "It only matters when n is greater than 30"],
    why:"Bessel's correction: using the sample mean slightly underestimates spread, and dividing by n−1 compensates." },
  { id:"q-prob-tz", t:"prob", q:"When should you use the t-distribution instead of the z-distribution?",
    opts:[
      "When the population standard deviation is unknown and estimated from the sample",
      "Whenever the sample size exceeds 30",
      "Only when working with proportions",
      "When the data are categorical"],
    why:"t accounts for the extra uncertainty of estimating σ with s. As n grows, t approaches z." },
  { id:"q-prob-clt", t:"prob", q:"The Central Limit Theorem states that as sample size grows, the distribution of the sample mean…",
    opts:[
      "Approaches a normal distribution regardless of the population's shape",
      "Becomes identical to the original population distribution",
      "Becomes uniform",
      "Spreads out with larger variance"],
    why:"Sample means tend toward normal with standard error σ/√n, even from non-normal populations." },
  { id:"q-prob-comb", t:"prob", q:"You pick a 3-person committee from 10 people, with no distinct roles. Which counting method applies?",
    opts:[
      "Combinations — order does not matter",
      "Permutations — order matters",
      "The binomial distribution",
      "Bayes' theorem"],
    why:"Identical roles mean ordering is irrelevant, so you use combinations (n choose r)." },
  { id:"q-prob-indep", t:"prob", q:"Two events are independent. What is P(A ∩ B)?",
    opts:[
      "P(A) · P(B)",
      "P(A) + P(B)",
      "P(A) − P(B)",
      "P(A | B)"],
    why:"Independence means one outcome doesn't affect the other, so the joint probability is just the product." },

  /* ───────── Engineering Economics ───────── */
  { id:"q-econ-tvm", t:"econ", q:"Why is $1,000 received five years from now worth less than $1,000 today?",
    opts:[
      "Money available today can be invested to earn interest (time value of money)",
      "Inflation is the only possible reason",
      "Future money is always taxed more heavily",
      "Banks charge fees to store future money"],
    why:"Today's dollar can grow at rate i, so a future dollar must be discounted back to compare fairly." },
  { id:"q-econ-npv", t:"econ", q:"A project's NPV is positive when discounted at your MARR. The decision rule says…",
    opts:[
      "Accept it — it earns more than the minimum acceptable rate",
      "Reject it — a positive NPV means it is overpriced",
      "Remain indifferent",
      "Accept only if the payback period is under two years"],
    why:"NPV > 0 means the return exceeds the MARR, adding value. Among alternatives, pick the highest NPV." },
  { id:"q-econ-cap", t:"econ", q:"The capitalized-cost formula P = A/i is used for what kind of cash flow?",
    opts:[
      "A perpetual series of equal payments (infinite life)",
      "A single lump sum received once in the future",
      "Straight-line depreciation",
      "A loan repaid over a fixed term"],
    why:"It's the present worth of an annuity as n → ∞ — think endowments or roads maintained forever." },
  { id:"q-econ-eff", t:"econ", q:"For the same nominal rate, increasing the compounding frequency produces…",
    opts:[
      "A higher effective annual rate",
      "A lower effective annual rate",
      "No change in the effective rate",
      "A negative real interest rate"],
    why:"More compounding periods means interest earns interest sooner, so i_eff = (1+r/m)^m − 1 rises with m." },

  /* ───────── Ethics & Professional Practice ───────── */
  { id:"q-eth-para", t:"ethics", q:"A design decision pits public safety against the client's budget. The code of ethics directs you to…",
    opts:[
      "Hold paramount the safety, health, and welfare of the public",
      "Follow the client's instructions since they pay",
      "Maximize the firm's profit",
      "Defer to the lowest-cost option"],
    why:"The first and overriding canon of every engineering code is protecting the public — it wins ties on the exam." },
  { id:"q-eth-coi", t:"ethics", q:"You realize you have a potential conflict of interest on a project. The correct first step is to…",
    opts:[
      "Disclose it fully to your client or employer",
      "Quietly withdraw without explanation",
      "Ignore it if the amount is small",
      "Accept a fee to offset the conflict"],
    why:"The ethical remedy for a conflict of interest is prompt, full disclosure — never concealment." },
  { id:"q-eth-comp", t:"ethics", q:"Under the code of ethics, an engineer should perform services…",
    opts:[
      "Only in their areas of competence",
      "In any field as long as they are licensed",
      "Anywhere, provided a colleague reviews it eventually",
      "Wherever the compensation is highest"],
    why:"Practicing outside your competence endangers the public; stamp only work within your training and discipline." },
  { id:"q-eth-lic", t:"ethics", q:"Professional engineering licensure exists primarily to…",
    opts:[
      "Protect the public",
      "Limit competition among engineers",
      "Raise engineer salaries",
      "Generate revenue for the state"],
    why:"Licensure safeguards public welfare. NCEES writes the Model Law; each state board grants and enforces the PE license." },

  /* ───────── Circuit Analysis ───────── */
  { id:"q-ckt-res", t:"circuits", q:"At resonance in a series RLC circuit, the total impedance is…",
    opts:[
      "Purely resistive, because X_L and X_C cancel",
      "Purely inductive",
      "Purely capacitive",
      "Maximum and entirely reactive"],
    why:"At f₀, X_L = X_C so the reactances cancel, leaving only R — current peaks in a series circuit." },
  { id:"q-ckt-par", t:"circuits", q:"Why is the equivalent resistance of parallel resistors always smaller than the smallest one?",
    opts:[
      "Adding parallel paths increases total conductance, which lowers resistance",
      "Because the voltages add together",
      "Resistances always average out",
      "Because current through the network decreases"],
    why:"Conductances (1/R) add in parallel. More paths for current ⇒ less overall opposition." },
  { id:"q-ckt-mpt", t:"circuits", q:"Maximum power is transferred to a load when…",
    opts:[
      "The load resistance equals the Thévenin resistance (efficiency is only 50%)",
      "The load resistance is as large as possible",
      "The load resistance is zero",
      "The load resistance equals the source voltage"],
    why:"R_L = R_th maximizes load power, but half the power is lost in R_th, so efficiency is just 50%." },
  { id:"q-ckt-cap", t:"circuits", q:"Why can a capacitor's voltage not change instantaneously?",
    opts:[
      "It would require infinite current, since i = C·dv/dt",
      "Capacitors block all current at every instant",
      "The stored charge is permanently fixed",
      "Series resistance always prevents it"],
    why:"A step change in v means dv/dt → ∞, demanding infinite current — physically impossible, so v is continuous." },
  { id:"q-ckt-eli", t:"circuits", q:"In the mnemonic 'ELI the ICE man,' for an inductor (L)…",
    opts:[
      "Voltage (E) leads current (I)",
      "Current leads voltage",
      "Voltage and current are in phase",
      "Voltage and current are 180° out of phase"],
    why:"ELI: in an inductor, E leads I by 90°. ICE: in a capacitor, I leads E. A handy phase reminder." },
  { id:"q-ckt-super", t:"circuits", q:"To apply superposition, how do you deactivate the sources you're not considering?",
    opts:[
      "Short-circuit voltage sources and open-circuit current sources",
      "Open voltage sources and short current sources",
      "Set every source to its average value",
      "Double the remaining source"],
    why:"A zero-volt source is a short; a zero-amp source is an open. Sum each source's individual contribution." },

  /* ───────── Electromagnetics ───────── */
  { id:"q-em-gauss", t:"emag", q:"Gauss's law states that the net electric flux through a closed surface depends on…",
    opts:[
      "Only the total charge enclosed by the surface",
      "All nearby charges, inside and outside",
      "The surface area alone",
      "The exact shape of the surface"],
    why:"Charges outside contribute equal inward and outward flux that cancels; only enclosed charge gives net flux." },
  { id:"q-em-lenz", t:"emag", q:"The minus sign in Faraday's law (Lenz's law) means the induced current…",
    opts:[
      "Opposes the change in magnetic flux that produced it",
      "Always flows clockwise",
      "Reinforces the flux change",
      "Is always zero"],
    why:"Induced effects oppose their cause — this is energy conservation expressed in electromagnetism." },
  { id:"q-em-mono", t:"emag", q:"What happens when you cut a bar magnet in half?",
    opts:[
      "You get two complete magnets, each with a north and south pole",
      "You isolate a separate north and south pole",
      "Both halves lose all magnetism",
      "You create one stronger magnet"],
    why:"No magnetic monopoles exist — field lines always close, so each piece is a full dipole (∮B·dA = 0)." },
  { id:"q-em-z0", t:"emag", q:"The characteristic impedance Z₀ of a lossless transmission line depends on…",
    opts:[
      "Its inductance and capacitance per unit length, not its physical length",
      "Its total physical length",
      "The source frequency only",
      "The value of the load resistance"],
    why:"Z₀ = √(L/C) using per-unit-length values — a property of the line's geometry, independent of length." },

  /* ───────── Electronics ───────── */
  { id:"q-el-opamp", t:"elec", q:"For an ideal op-amp with negative feedback, the two 'golden rules' are…",
    opts:[
      "No current enters the inputs, and the two inputs sit at the same voltage",
      "Infinite output current and zero gain",
      "The inputs draw equal current and differ by 0.7 V",
      "The output always equals the supply rail"],
    why:"Infinite input impedance ⇒ no input current; infinite open-loop gain + feedback ⇒ a virtual short between inputs." },
  { id:"q-el-bjt", t:"elec", q:"To use a BJT as a linear amplifier, you bias it in the…",
    opts:[
      "Active region",
      "Saturation region",
      "Cutoff region",
      "Reverse-breakdown region"],
    why:"In the active region I_C = βI_B holds and the transistor amplifies. Saturation and cutoff act like a switch." },
  { id:"q-el-zener", t:"elec", q:"A Zener diode regulates voltage by operating in…",
    opts:[
      "Reverse breakdown, where its voltage stays nearly constant",
      "Forward conduction",
      "Cutoff",
      "Saturation"],
    why:"Reverse-biased past its Zener voltage, the diode holds a stable voltage across a load — a simple regulator." },
  { id:"q-el-inv", t:"elec", q:"An inverting op-amp amplifier has a gain of −R_f/R₁. What is its input impedance (approximately)?",
    opts:[
      "R₁, the input resistor",
      "Infinite",
      "R_f, the feedback resistor",
      "Zero"],
    why:"The inverting input is a virtual ground, so the source 'sees' just R₁ to ground." },

  /* ───────── Power ───────── */
  { id:"q-pw-pf", t:"power", q:"A load has a poor (low) power factor. What does that imply?",
    opts:[
      "A large share of the apparent power is reactive, raising the line current",
      "More real work is done per amp delivered",
      "The load is purely resistive",
      "The system is operating more efficiently"],
    why:"Low pf = big angle between V and I, so extra current flows that does no real work, increasing I²R losses." },
  { id:"q-pw-pfc", t:"power", q:"To correct a lagging (inductive) power factor, you typically add…",
    opts:[
      "Parallel capacitors to supply reactive power locally",
      "Series inductors",
      "More resistive load",
      "A larger step-up transformer"],
    why:"Capacitors supply the leading reactive power the inductive load needs, pushing pf toward 1 and cutting line current." },
  { id:"q-pw-wye", t:"power", q:"In a balanced wye (Y) connection, how do line and phase quantities relate?",
    opts:[
      "Line voltage = √3 × phase voltage; line current = phase current",
      "Line voltage = phase voltage; line current = √3 × phase current",
      "Both line voltage and current are √3 × phase values",
      "Line voltage = phase voltage ÷ 3"],
    why:"Wye: V_L = √3·V_φ and I_L = I_φ. Delta is the mirror image (I_L = √3·I_φ, V_L = V_φ)." },
  { id:"q-pw-rms", t:"power", q:"The RMS value of a sinusoid is its peak divided by √2 because…",
    opts:[
      "RMS represents the equivalent steady (heating) power of the waveform",
      "It equals the simple time-average of the sine wave",
      "Peak and RMS values are always equal",
      "It corrects for the 60 Hz line frequency"],
    why:"RMS is the DC value that delivers the same average power; for a pure sine that works out to V_m/√2." },

  /* ───────── Control Systems ───────── */
  { id:"q-ctl-stab", t:"control", q:"A continuous LTI system is stable if and only if all of its poles…",
    opts:[
      "Lie in the left half of the s-plane (negative real parts)",
      "Lie exactly on the imaginary axis",
      "Are real numbers",
      "Lie inside the unit circle"],
    why:"Left-half-plane poles give decaying responses. Any pole with a positive real part makes the system blow up." },
  { id:"q-ctl-damp", t:"control", q:"Raising the damping ratio ζ from 0.3 toward 1 in a second-order system will…",
    opts:[
      "Reduce overshoot, reaching none at ζ = 1 (critically damped)",
      "Increase the overshoot",
      "Make it oscillate forever",
      "Leave overshoot unchanged"],
    why:"Overshoot depends only on ζ; higher ζ damps oscillation. ζ = 1 is the fastest response with zero overshoot." },
  { id:"q-ctl-pid", t:"control", q:"In a PID controller, the integral term primarily…",
    opts:[
      "Eliminates steady-state error by accumulating past error",
      "Anticipates future error",
      "Adds damping to the response",
      "Sets the proportional gain"],
    why:"Integration keeps acting until the accumulated error is zero, driving steady-state error to zero." },
  { id:"q-ctl-type", t:"control", q:"A Type 1 system (one pure integrator) tracks which input with zero steady-state error?",
    opts:[
      "A step input",
      "A ramp input",
      "A parabolic input",
      "A sinusoidal input"],
    why:"System type = number of integrators. Type 1 nails a step; it tracks a ramp with finite error, a parabola with infinite error." },
  { id:"q-ctl-margin", t:"control", q:"On a Bode plot, larger gain and phase margins indicate a system that is…",
    opts:[
      "More robustly stable",
      "Faster but unstable",
      "Closer to the edge of instability",
      "Higher in steady-state error"],
    why:"Margins measure how much extra gain or phase lag the loop tolerates before instability — bigger is safer." },

  /* ───────── Communications ───────── */
  { id:"q-co-nyq", t:"comm", q:"To avoid aliasing, the Nyquist criterion says you must sample at…",
    opts:[
      "More than twice the highest frequency in the signal",
      "Exactly the signal's frequency",
      "Half the highest frequency",
      "Any rate, as long as you filter afterward"],
    why:"Sampling below 2·f_max folds high frequencies into low ones (aliasing) that can't be undone later." },
  { id:"q-co-fm", t:"comm", q:"Why does FM generally resist noise better than AM?",
    opts:[
      "Information rides in the frequency, while noise mainly corrupts amplitude",
      "FM uses much less bandwidth",
      "FM always transmits at higher power",
      "Noise cannot affect a frequency-modulated wave"],
    why:"Since the message is in frequency, amplitude-based noise can be limited/clipped at the receiver." },
  { id:"q-co-db", t:"comm", q:"You should use 20·log₁₀ (rather than 10·log₁₀) when computing decibels for…",
    opts:[
      "Voltage or amplitude ratios, because power is proportional to V²",
      "Power ratios",
      "Frequency ratios",
      "Any ratio, always"],
    why:"dB is defined on power. For voltage, P ∝ V², and the squared term pulls a factor of 2 out front: 20·log." },
  { id:"q-co-baud", t:"comm", q:"With M-ary signaling, how does bit rate relate to baud (symbol) rate?",
    opts:[
      "Bit rate = baud rate × log₂(M)",
      "Bit rate = baud rate × M",
      "Bit rate = baud rate ÷ M",
      "Bit rate equals the baud rate"],
    why:"Each of M symbols carries log₂(M) bits, so more levels pack more bits into every symbol." },

  /* ───────── Signal Processing ───────── */
  { id:"q-dsp-conv", t:"dsp", q:"Convolution in the time domain corresponds to what operation in the frequency domain?",
    opts:[
      "Multiplication",
      "Convolution again",
      "Addition",
      "Differentiation"],
    why:"The convolution theorem: convolving signals in time equals multiplying their spectra in frequency." },
  { id:"q-dsp-stab", t:"dsp", q:"A discrete-time (digital) system is stable when all of its poles lie…",
    opts:[
      "Inside the unit circle (|z| < 1)",
      "In the left half of the s-plane",
      "Outside the unit circle",
      "Exactly on the real axis"],
    why:"The z-domain stability region is the unit circle, the discrete counterpart of the s-plane's left half." },
  { id:"q-dsp-aa", t:"dsp", q:"Where must an anti-aliasing filter be placed?",
    opts:[
      "Before the sampler, to remove frequencies above the Nyquist limit",
      "After the sampler",
      "Only in the reconstruction stage",
      "Inside the DAC at the output"],
    why:"Once aliasing occurs during sampling it's irreversible, so the low-pass filter must come first." },
  { id:"q-dsp-fir", t:"dsp", q:"Compared with IIR filters, FIR filters are…",
    opts:[
      "Always stable and able to have exactly linear phase, but need more taps",
      "More efficient but potentially unstable",
      "Always unstable",
      "Identical in computational cost"],
    why:"FIR filters have no feedback (only zeros) so they can't go unstable and can be linear-phase, at the cost of more taps." },
  { id:"q-dsp-fft", t:"dsp", q:"The FFT improves on the direct DFT by reducing computation from O(N²) to…",
    opts:[
      "O(N log N)",
      "O(N)",
      "O(log N)",
      "O(N³)"],
    why:"The FFT is a fast algorithm for the same DFT result — the speedup is enormous for large N." },

  /* ───────── Linear Systems ───────── */
  { id:"q-ls-bibo", t:"linsys", q:"A system is BIBO stable when…",
    opts:[
      "Every bounded input produces a bounded output",
      "It contains no feedback paths",
      "Its output is always zero",
      "It is time-varying"],
    why:"Bounded-Input Bounded-Output stability is equivalent to the impulse response being absolutely integrable." },
  { id:"q-ls-causal", t:"linsys", q:"For a causal system, the impulse response h(t) must be…",
    opts:[
      "Zero for t < 0",
      "Symmetric about t = 0",
      "Constant for all t",
      "Zero for t > 0"],
    why:"A causal system can't respond before the input arrives, so h(t) = 0 for negative time." },
  { id:"q-ls-ss", t:"linsys", q:"In the state-space model ẋ = Ax + Bu, the system's poles are…",
    opts:[
      "The eigenvalues of A",
      "The entries of B",
      "The eigenvalues of D",
      "The columns of C"],
    why:"The A matrix governs the natural dynamics, so its eigenvalues are the poles that set stability." },

  /* ───────── Digital Systems ───────── */
  { id:"q-dg-dm", t:"digital", q:"By De Morgan's theorem, the complement of (A · B) equals…",
    opts:[
      "(NOT A) OR (NOT B)",
      "(NOT A) AND (NOT B)",
      "A OR B",
      "A AND B"],
    why:"'Break the bar and change the operator': NAND becomes an OR of the inverted inputs." },
  { id:"q-dg-univ", t:"digital", q:"NAND and NOR are called 'universal' gates because…",
    opts:[
      "Any Boolean function can be built using only that one gate type",
      "They switch faster than all other gates",
      "They require no transistors",
      "They can never output a 0"],
    why:"With NAND (or NOR) alone you can construct NOT, AND, and OR, hence any logic function — cheap and ubiquitous." },
  { id:"q-dg-twos", t:"digital", q:"To negate a number in two's-complement representation, you…",
    opts:[
      "Invert all the bits and add 1",
      "Invert all the bits only",
      "Add 1 to the most significant bit",
      "Flip only the sign bit"],
    why:"Invert-and-add-1 gives a representation where ordinary binary addition handles signed values seamlessly." },
  { id:"q-dg-setup", t:"digital", q:"Violating a flip-flop's setup or hold time can cause…",
    opts:[
      "Metastability — an unpredictable, possibly oscillating output",
      "A guaranteed logic 0",
      "Faster operation",
      "Lower power consumption"],
    why:"If data changes inside the forbidden window, the flip-flop may hover between states unpredictably." },
  { id:"q-dg-seq", t:"digital", q:"How does sequential logic differ from combinational logic?",
    opts:[
      "It has memory and its output depends on a clock and past state",
      "It is built only from NAND gates",
      "It has no inputs",
      "It cannot contain flip-flops"],
    why:"Combinational output depends only on present inputs; sequential logic adds storage (flip-flops) and timing." },

  /* ───────── Computer Networks ───────── */
  { id:"q-net-tcp", t:"networks", q:"You need reliable, in-order delivery for a file transfer. Which protocol fits?",
    opts:[
      "TCP — connection-oriented with acknowledgments and retransmission",
      "UDP — connectionless and fast with no guarantees",
      "ARP",
      "ICMP"],
    why:"TCP guarantees ordered, error-checked delivery. UDP trades reliability for speed (streaming, gaming, DNS)." },
  { id:"q-net-router", t:"networks", q:"A router forwards traffic between different networks using which addresses, at which layer?",
    opts:[
      "IP addresses, at Layer 3 (Network)",
      "MAC addresses, at Layer 2 (Data Link)",
      "Port numbers, at Layer 4 (Transport)",
      "Physical signals, at Layer 1"],
    why:"Routers route by IP (Layer 3) between networks; switches forward by MAC (Layer 2) within one network." },
  { id:"q-net-mac", t:"networks", q:"How does a MAC address differ from an IP address?",
    opts:[
      "MAC is a permanent physical address for local delivery; IP is a logical, routable address",
      "MAC is assigned by DNS each session",
      "MAC changes with every packet",
      "IP is burned into the hardware permanently"],
    why:"MAC = Layer 2 hardware identity (local); IP = Layer 3 logical address (end-to-end). ARP maps IP → MAC." },
  { id:"q-net-subnet", t:"networks", q:"How many usable host addresses does a /24 subnet provide?",
    opts:[
      "254",
      "256",
      "24",
      "512"],
    why:"/24 leaves 8 host bits → 256 addresses, minus the network and broadcast addresses = 254 usable." },

  /* ───────── Computer Systems ───────── */
  { id:"q-cs-vn", t:"compsys", q:"The 'von Neumann bottleneck' arises because…",
    opts:[
      "Instructions and data share a single memory and bus",
      "The CPU has too many registers",
      "Caches are made too large",
      "There is no operating system present"],
    why:"With one shared path, instruction and data transfers compete, limiting throughput. Harvard uses separate buses." },
  { id:"q-cs-amdahl", t:"compsys", q:"Amdahl's law says overall speedup from parallelization is ultimately limited by…",
    opts:[
      "The fraction of the task that cannot be parallelized",
      "The number of processor cores only",
      "The clock frequency",
      "The size of the cache"],
    why:"Even infinite speedup on the parallel part leaves the serial fraction unchanged, capping total speedup." },
  { id:"q-cs-hier", t:"compsys", q:"Moving down the memory hierarchy (registers → cache → RAM → disk), storage becomes…",
    opts:[
      "Larger and cheaper per bit, but slower",
      "Smaller and faster",
      "Faster and cheaper at once",
      "Increasingly volatile"],
    why:"Each level trades speed for capacity and cost. Caching exploits locality so most accesses hit the fast levels." },
  { id:"q-cs-int", t:"compsys", q:"Why are interrupts generally more efficient than polling?",
    opts:[
      "The CPU is freed for other work until hardware signals it needs attention",
      "Interrupts use less memory",
      "Interrupts never require saving CPU state",
      "Polling cannot detect events at all"],
    why:"Polling burns cycles repeatedly checking; an interrupt lets the CPU react only when an event actually occurs." },

  /* ───────── Software Engineering ───────── */
  { id:"q-sw-bin", t:"swe", q:"Binary search requires that the data be…",
    opts:[
      "Sorted",
      "Stored in a linked list",
      "Composed of unique values",
      "Purely numeric"],
    why:"Each step discards half the range based on order, so the collection must be sorted. Otherwise use linear search." },
  { id:"q-sw-quick", t:"swe", q:"What is quicksort's worst-case time complexity?",
    opts:[
      "O(n²)",
      "O(n log n)",
      "O(log n)",
      "O(n)"],
    why:"Bad pivots (e.g. already-sorted input with naive pivoting) degrade it to O(n²); average case is O(n log n)." },
  { id:"q-sw-stack", t:"swe", q:"Which task is a stack (LIFO) best suited for?",
    opts:[
      "Tracking function calls / implementing undo",
      "Scheduling jobs in arrival order",
      "Breadth-first traversal",
      "Buffering a data stream in order"],
    why:"A stack's last-in-first-out order matches nested calls and undo history. Queues (FIFO) handle arrival-order tasks." },
  { id:"q-sw-list", t:"swe", q:"Compared with an array, a linked list offers…",
    opts:[
      "O(1) insert/delete at a known node, but O(n) random access",
      "O(1) random access by index",
      "Faster indexing overall",
      "Guaranteed contiguous memory"],
    why:"Arrays give O(1) indexing but costly mid-insertion; linked lists flip that trade-off." },
  { id:"q-sw-hash", t:"swe", q:"A hash table degrades from O(1) toward O(n) operations when…",
    opts:[
      "Many keys collide due to a poor hash function",
      "The table is completely empty",
      "All keys happen to be integers",
      "The table is allocated too large"],
    why:"Collisions pile entries into the same bucket; in the worst case a lookup must scan them all, becoming O(n)." }
];
