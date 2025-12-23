import { cva } from "class-variance-authority";

export const badgeVariants = cva(
  "inline-flex items-center justify-center text-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary text-primary-foreground",
        secondary: "border-transparent bg-secondary text-secondary-foreground",
        destructive: "border-transparent bg-destructive text-destructive-foreground",
        outline: "text-foreground",
        scheduled: "border-transparent bg-[#FEE1C7] text-[#A04C03]",
        completed: "border-transparent bg-[#DCFAF5] text-[#127D6B]",
        cancelled: "border-transparent bg-[#FCEAEA] text-[#B60909]",
        no_show: "border-transparent bg-[#D8DFE6] text-[#70767A]",
        new: "border-transparent bg-[#CDE7F4] text-[#28455E]",
        draft: "border-transparent bg-[#D8DFE6] text-[#70767A]",
        active: "border-transparent bg-[#DCFAF5] text-[#127D6B]",
        inactive: "border-transparent bg-[#D8DFE6] text-[#70767A]",
        awaiting_approval: "border-transparent bg-[#FEE1C7] text-[#A04C03]",
        accepted: "border-transparent bg-[#DCFAF5] text-[#127D6B]",
        rejected: "border-transparent bg-[#FCEAEA] text-[#B60909]",
        approved: "border-transparent bg-[#DCFAF5] text-[#127D6B]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);
