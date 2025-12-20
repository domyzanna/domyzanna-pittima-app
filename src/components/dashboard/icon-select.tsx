
'use client';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { FormControl } from '@/components/ui/form';
import { iconNames } from '@/lib/icons';
import * as LucideIcons from 'lucide-react';

interface IconSelectProps {
  selectedValue: string;
  onValueChange: (value: string) => void;
}

export function IconSelect({ selectedValue, onValueChange }: IconSelectProps) {
  return (
    <Select onValueChange={onValueChange} defaultValue={selectedValue}>
      <FormControl>
        <SelectTrigger>
          <SelectValue placeholder="Seleziona un'icona" />
        </SelectTrigger>
      </FormControl>
      <SelectContent>
        <ScrollArea className="h-72">
          {iconNames.map((iconName) => {
            const Icon = (LucideIcons as any)[iconName] as React.ElementType;
            return (
              <SelectItem key={iconName} value={iconName}>
                <div className="flex items-center gap-2">
                  {Icon ? <Icon className="h-4 w-4" /> : null}
                  <span>{iconName}</span>
                </div>
              </SelectItem>
            );
          })}
        </ScrollArea>
      </SelectContent>
    </Select>
  );
}
