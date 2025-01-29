// ~/src/app/_components/shared/ui/SelectField/SelectField.tsx
"use client";

import * as React from "react"

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
    SelectValue,
} from "~/app/_components/ui/select";

interface SelectFieldProps {
    options: { value: string; label: string }[];
    value: string;
    onValueChange: (value: string) => void;
    placeholder: string;
    required?: boolean;
    disabled?: boolean;
}

export function SelectField({ options, value, onValueChange, placeholder, required, disabled }: SelectFieldProps) {

  return (
    <Select value={value} onValueChange={onValueChange} required={required}>
            <SelectTrigger className="w-[180px]">
                <SelectValue placeholder={placeholder} />
            </SelectTrigger>
            <SelectContent>
                <SelectGroup>
                    {options.map((option) => (
                        <SelectItem key={option.value} value={option.value} disabled={disabled}>
                            {option.label}
                        </SelectItem>
                    ))}
                </SelectGroup>
            </SelectContent>
        </Select>
  )
}
