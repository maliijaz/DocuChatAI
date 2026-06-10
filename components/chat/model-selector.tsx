"use client";

import { ModelConfig } from "@/lib/models";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, Cpu, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface ModelSelectorProps {
  models: ModelConfig[];
  selectedModelId: string;
  onModelChange: (modelId: string) => void;
  disabled?: boolean;
}

const PROVIDER_LABELS: Record<string, string> = {
  google: "Google",
  groq: "Groq",
  anthropic: "Anthropic",
};

export function ModelSelector({
  models,
  selectedModelId,
  onModelChange,
  disabled,
}: ModelSelectorProps) {
  const current = models.find((m) => m.id === selectedModelId) ?? models[0];

  const freeModels = models.filter((m) => m.badge === "Free");
  const proModels = models.filter((m) => m.badge === "Pro");

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          disabled={disabled}
          className="gap-1.5 h-8 text-xs font-normal max-w-[180px]"
        >
          <Cpu className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
          <span className="truncate">{current?.name ?? "Select model"}</span>
          <ChevronDown className="h-3 w-3 opacity-50 shrink-0" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-72">
        {freeModels.length > 0 && (
          <>
            <DropdownMenuLabel className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
              Free models
            </DropdownMenuLabel>
            {freeModels.map((model) => (
              <ModelItem
                key={model.id}
                model={model}
                isSelected={model.id === selectedModelId}
                providerLabel={PROVIDER_LABELS[model.provider]}
                onSelect={() => onModelChange(model.id)}
              />
            ))}
          </>
        )}

        {freeModels.length > 0 && proModels.length > 0 && (
          <DropdownMenuSeparator />
        )}

        {proModels.length > 0 && (
          <>
            <DropdownMenuLabel className="text-xs font-medium text-muted-foreground">
              Pro models
            </DropdownMenuLabel>
            {proModels.map((model) => (
              <ModelItem
                key={model.id}
                model={model}
                isSelected={model.id === selectedModelId}
                providerLabel={PROVIDER_LABELS[model.provider]}
                onSelect={() => onModelChange(model.id)}
              />
            ))}
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function ModelItem({
  model,
  isSelected,
  providerLabel,
  onSelect,
}: {
  model: ModelConfig;
  isSelected: boolean;
  providerLabel: string;
  onSelect: () => void;
}) {
  return (
    <DropdownMenuItem
      onClick={onSelect}
      className={cn("flex items-start gap-2 py-2 cursor-pointer", isSelected && "bg-accent")}
    >
      <Check
        className={cn("h-3.5 w-3.5 mt-0.5 shrink-0", isSelected ? "opacity-100" : "opacity-0")}
      />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-medium text-sm">{model.name}</span>
          <span className="text-[10px] text-muted-foreground ml-auto shrink-0">{providerLabel}</span>
        </div>
        <p className="text-xs text-muted-foreground mt-0.5 leading-snug">
          {model.description}
        </p>
      </div>
    </DropdownMenuItem>
  );
}
