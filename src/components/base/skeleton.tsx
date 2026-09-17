import type { ComponentProps } from "react";

import { cx } from "@/utils/cx";

export function Skeleton({ className, ...props }: ComponentProps<"div">) {
    return <div aria-hidden="true" className={cx("animate-pulse rounded-lg bg-secondary", className)} {...props} />;
}
