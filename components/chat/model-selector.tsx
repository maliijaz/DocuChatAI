"use client";

import { ModelConfig } from "@/lib/models";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ChevronDown, Cpu, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface ModelSelectorProps {
  models: ModelConfig[];
  selectedModelId: string;
  onModelChange: (modelId: string) => void;
  disabled?: boolean;
}

export function ModelSelector({
  models,
  selectedModelId,
  onModelChange,
  disabled,
}: ModelSelectorProps) {
  const current = models.find((m) => m.id === selectedModelId) ?? models[0];

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
        <DropdownMenuLabel className="text-xs font-medium text-muted-foreground">
          Models
        </DropdownMenuLabel>
        {models.map((model) => (
          <ModelItem
            key={model.id}
            model={model}
            isSelected={model.id === selectedModelId}
            onSelect={() => onModelChange(model.id)}
          />
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function ModelItem({
  model,
  isSelected,
  onSelect,
}: {
  model: ModelConfig;
  isSelected: boolean;
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
        <span className="font-medium text-sm">{model.name}</span>
        <p className="text-xs text-muted-foreground mt-0.5 leading-snug">
          {model.description}
        </p>
      </div>
    </DropdownMenuItem>
  );
}
