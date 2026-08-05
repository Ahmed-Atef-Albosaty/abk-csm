import { motion } from "framer-motion";

function SplashLoader() {
  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#0D2B5E]"
    >
      {/* Spinning ring */}
      <div className="relative w-32 h-32 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1.6, repeat: Infinity, ease: "linear" }}
          className="absolute inset-0 rounded-full"
          style={{
            background: "conic-gradient(from 0deg, #f9c723 0%, #3685c6 40%, transparent 70%)",
            WebkitMask: "radial-gradient(circle, transparent 64%, black 65%)",
            mask: "radial-gradient(circle, transparent 64%, black 65%)",
          }}
        />

        {/* ABK mark centered */}
        <div className="w-16 h-16 flex items-center justify-center">
          <svg viewBox="126 22 78 78" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
            <g transform="matrix(1.25,0,0,-1.25,137.94713,70.805105)">
              <path d="M 0,0 C -0.007,1.689 1.164,2.768 2.253,3.91 L 17.418,19.064 12.917,23.567 -1.276,9.385 C -4.569,6.089 -6.369,4.308 -6.369,1.068 l 0,-14.595 c 0,-3.737 1.83,-5.55 5.604,-5.55 l 14.542,0 c 1.193,0 2.25,0.293 3.249,0.824 L 11.49,-12.708 0,-12.708 0,0" fill="#fab20b"/>
            </g>
            <g transform="matrix(1.25,0,0,-1.25,171.10088,86.646355)">
              <path d="m 0,0 c -1.686,-0.004 -2.769,1.163 -3.909,2.254 l -15.155,15.163 -4.502,-4.498 14.185,-14.195 c 3.296,-3.292 5.073,-5.092 8.313,-5.092 l 14.598,0 c 3.731,0 5.549,1.83 5.549,5.605 l 0,14.542 c -0.003,1.191 -0.29,2.248 -0.825,3.247 L 12.708,11.491 12.708,0 0,0" fill="#1574c4"/>
            </g>
            <g transform="matrix(1.25,0,0,-1.25,186.94838,53.492605)">
              <path d="m 0,0 c 0.005,-1.685 -1.168,-2.768 -2.256,-3.905 l -15.162,-15.159 4.494,-4.5 14.195,14.183 c 3.295,3.292 5.097,5.073 5.097,8.313 l 0,14.595 c 0,3.737 -1.836,5.55 -5.608,5.55 l -14.54,0 c -1.194,0 -2.252,-0.293 -3.251,-0.824 L -11.495,12.708 0,12.708 0,0" fill="#fab20b"/>
            </g>
            <g transform="matrix(1.25,0,0,-1.25,153.78838,37.646356)">
              <path d="m 0,0 c 1.688,0.003 2.773,-1.169 3.907,-2.254 l 15.162,-15.163 4.498,4.493 L 9.382,1.271 C 6.087,4.564 4.307,6.368 1.072,6.368 l -14.599,0 c -3.738,0 -5.549,-1.835 -5.549,-5.606 l 0,-14.542 c 0.001,-1.196 0.291,-2.252 0.823,-3.251 l 5.545,5.536 0,11.495 L 0,0" fill="#1574c4"/>
            </g>
          </svg>
        </div>
      </div>

      {/* Label */}
      <motion.p
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.4 }}
        className="mt-6 text-white/60 text-xs tracking-[0.2em] uppercase font-medium"
      >
        Al Ahli Bank of Kuwait
      </motion.p>
    </motion.div>
  );
}

export default SplashLoader;
