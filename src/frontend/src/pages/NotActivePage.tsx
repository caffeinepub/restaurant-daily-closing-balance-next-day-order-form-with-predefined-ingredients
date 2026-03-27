import { Construction } from "lucide-react";
import { motion } from "motion/react";

export default function NotActivePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="space-y-4"
      >
        <div className="flex items-center justify-center">
          <div
            className="rounded-full flex items-center justify-center"
            style={{ width: 80, height: 80, background: "#f1f5f9" }}
          >
            <Construction size={40} color="#94a3b8" strokeWidth={1.5} />
          </div>
        </div>
        <h2 className="text-2xl font-bold text-foreground">Not Active</h2>
        <p className="text-muted-foreground max-w-xs mx-auto">
          This module will be available soon. Stay tuned!
        </p>
      </motion.div>
    </div>
  );
}
