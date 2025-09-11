'use client';

import * as React from 'react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { Check, ChevronDown } from 'lucide-react';

interface MultiSelectProps {
  value: string[];
  onChange: (value: string[]) => void;
  options: { id: string; name: string }[];
  placeholder?: string;
}

export function MultiSelect({
  value,
  onChange,
  options,
  placeholder = 'Select...',
}: MultiSelectProps) {
  const handleToggle = (id: string) => {
    if (value.includes(id)) {
      onChange(value.filter((v) => v !== id));
    } else {
      onChange([...value, id]);
    }
  };

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button
          type="button"
          className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-transparent px-3 py-2 text-sm"
        >
          <span className="truncate">
            {value.length
              ? options
                  .filter((opt) => value.includes(opt.id))
                  .map((opt) => opt.name)
                  .join(', ')
              : placeholder}
          </span>
          <ChevronDown className="h-4 w-4 opacity-50" />
        </button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Content
        side="bottom"
        className="z-50 min-w-[12rem] rounded-md border bg-popover p-1 shadow-md"
      >
        {options.map((opt) => (
          <DropdownMenu.CheckboxItem
            key={opt.id}
            checked={value.includes(opt.id)}
            onCheckedChange={() => handleToggle(opt.id)}
            className="flex cursor-pointer select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm focus:bg-accent"
          >
            <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
              {value.includes(opt.id) && <Check className="h-4 w-4" />}
            </span>
            {opt.name}
          </DropdownMenu.CheckboxItem>
        ))}
      </DropdownMenu.Content>
    </DropdownMenu.Root>
  );
}
