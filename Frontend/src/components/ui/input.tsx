    // Input component extends from shadcnui - https://ui.shadcn.com/docs/components/input
    "use client";
    import * as React from "react";
    import { cn } from "@/lib/utils";
    import { useMotionTemplate, useMotionValue, motion } from "framer-motion";
    // import { MouseMoveEvent } from "@/types";

    export type InputProps = React.InputHTMLAttributes<HTMLInputElement>;


    const Input = React.forwardRef<HTMLInputElement, InputProps>(
    ({ className, type, ...props }, ref) => {
        const radius = 600; // change this to increase the rdaius of the hover effect
        const [visible, setVisible] = React.useState(false);

        const mouseX = useMotionValue(0);
        const mouseY = useMotionValue(0);

        function handleMouseMove({ currentTarget, clientX, clientY }: any) {
        const { left, top } = currentTarget.getBoundingClientRect();

        mouseX.set(clientX - left);
        mouseY.set(clientY - top);
        }
        return (
        <motion.div
            style={{
            background: useMotionTemplate`
            radial-gradient(
            ${visible ? radius + "px" : "0px"} circle at ${mouseX}px ${mouseY}px,
            var(--signal-violet),
            transparent 80%
            )
        `,
            }}
            onMouseMove={handleMouseMove}
            onMouseEnter={() => setVisible(true)}
            onMouseLeave={() => setVisible(false)}
            className="p-[2px] rounded-lg transition duration-300 group/input"
        >
            <input
            type={type}
            className={cn(
                `flex h-10 w-full border-none bg-dusk/50 text-ink shadow-input rounded-md px-3 py-2 text-sm file:border-0 file:bg-transparent 
            file:text-sm file:font-medium placeholder:text-ink-dim/50 
            focus-visible:outline-none focus-visible:ring-[2px] focus-visible:ring-signal-violet/50
            disabled:cursor-not-allowed disabled:opacity-50
            shadow-[0px_0px_1px_1px_var(--ink-dim)]
            group-hover/input:shadow-none transition duration-400 font-mono
            `,
                className
            )}
            ref={ref}
            {...props}
            />
        </motion.div>
        );
    }
    );
    Input.displayName = "Input";

    export { Input };
