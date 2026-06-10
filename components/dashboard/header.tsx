"use client";

import { useSession } from "next-auth/react";
import { Badge } from "@/components/ui/badge";
import { PLAN_DETAILS } from "@/lib/plans";
import { Plan } from "@/lib/types";

interface DashboardHeaderProps {
  title: string;
  description?: string;
}

export function DashboardHeader({ title, description }: DashboardHeaderProps) {
  const { data: session } = useSession();

  return (
    <div className="flex items-start justify-between">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
        {description && (
          <p className="text-muted-foreground mt-1">{description}</p>
        )}
      </div>
    </div>
  );
}
