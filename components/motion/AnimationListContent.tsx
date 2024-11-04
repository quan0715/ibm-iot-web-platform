import { motion } from "framer-motion";
import React from "react";

export function AnimationListContent({
  className,
  style,
  index,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & {
  index: number; // index of the item in the list
}) {
  return (
    <motion.div
      // key={index}
      initial="initial"
      animate="animate"
      exit="exit"
      custom={index}
      variants={{
        initial: { opacity: 0, y: -20 },
        animate: (index) => ({
          opacity: 1,
          y: 0,
          transition: { duration: 0.3, delay: index * 0.03 },
        }),
        exit: { opacity: 0, y: 20 },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
