// src/app/_components/shared/CustomComboBox.tsx
"use client"

import * as React from "react"
import { Check, ChevronsUpDown, Loader2 } from "lucide-react"
import { cn } from "~/lib/utils"
import { Button } from "~/app/_components/ui/button"
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "~/app/_components/ui/command"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "~/app/_components/ui/popover"

interface ComboboxProps {
    options: { value: string; label: string }[]
    value: string
    onValueChange: (value: string) => void
    placeholder: string
    emptyText: string
    searchPlaceholder: string
    className?: string
    onSearchChange?: (term: string) => void
    showSpinner?: boolean
}

export function CustomComboBox({
    options,
    value,
    onValueChange,
    placeholder,
    emptyText,
    searchPlaceholder,
    className,
    onSearchChange,
    showSpinner = false
}: ComboboxProps) {
    const [open, setOpen] = React.useState(false);

    const handleSearchChange = (term: string) => {
        if (onSearchChange) {
            onSearchChange(term);
        }
    };

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className={cn("justify-between", className)}
                >
                    {value
                        ? options.find((option) => option.value === value)?.label
                        : placeholder}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className={cn("p-0", className)}>
                <Command shouldFilter={true}>
                    <CommandInput placeholder={searchPlaceholder} className="..." onValueChange={handleSearchChange} />
                    <CommandList>
                        <CommandEmpty>
                            {showSpinner ? (
                                <div className="flex items-center justify-center py-6">
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                </div>
                            ) : (
                                emptyText
                            )}
                        </CommandEmpty>
                        <CommandGroup>
                            {!showSpinner && options.map((option) => (
                                <CommandItem
                                    key={option.value}
                                    value={option.label}
                                    onSelect={() => {
                                        onValueChange(option.value);
                                        setOpen(false);
                                    }}
                                >
                                    <Check
                                        className={cn(
                                            "mr-2 h-4 w-4",
                                            value === option.value ? "opacity-100" : "opacity-0"
                                        )}
                                    />
                                    {option.label}
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    );
}