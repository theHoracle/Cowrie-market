import { useEffect, useMemo, useState } from "react";
import { Chain } from "@chain-registry/types";
import { Avatar } from "@interchain-ui/react";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import {
  Command,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandItem,
  CommandGroup,
} from "@/components/ui/command";
import { Button } from "../ui/button";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";

export type ChainSelectProps = {
  chains: Chain[];
  chainName?: string;
  onChange: (chainName?: string) => void;
};

export function ChainSelect({
  chainName,
  chains = [],
  onChange,
}: ChainSelectProps) {
  const [value, setValue] = useState<string>();

  const [open, setOpen] = useState(false);

  const cache = useMemo(
    () =>
      chains.reduce(
        (cache, chain) => ((cache[chain.chain_name] = chain), cache),
        {} as Record<string, Chain[][number]>,
      ),
    [chains],
  );

  useEffect(() => {
    if (!chainName) setValue(undefined);

    if (chainName && chains.length > 0) {
      const chain = cache[chainName];

      if (chain) {
        setValue(chain.chain_name);
        onChange(chain.chain_name);
      }
    }
  }, [chains, chainName]);

  const avatar = cache[value!]?.logo_URIs?.png || cache[value!]?.logo_URIs?.svg;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full capitalize flex items-center h-10 justify-between"
        >
          <div className="flex items-center gap-2">
            <img
              src={avatar || "/placeholder.png"}
              alt={value}
              height={25}
              width={25}
              className="rounded-full"
            />
            {value
              ? chains.find((chain) => chain.chain_name === value)?.chain_name
              : "Select Chain..."}
          </div>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent>
        <Command>
          <CommandInput placeholder="Search chains" className="h-9" />
          <CommandList>
            <CommandEmpty>No chain found...</CommandEmpty>
            <CommandGroup>
              {chains.map((chain) => (
                <CommandItem
                  key={chain.chain_id}
                  value={chain.chain_name}
                  onSelect={(currentValue) => {
                    setValue(currentValue === value ? "" : currentValue);
                    setOpen(false);
                  }}
                  className="capitalize"
                >
                  <div>
                    <img
                      src={chain.logo_URIs?.png || "/placeholder.png"}
                      alt={chain.chain_name}
                      height={30}
                      width={30}
                      className="rounded-full"
                    />
                  </div>
                  {chain.chain_name}
                  <Check
                    className={cn(
                      "ml-auto",
                      value === chain.chain_name ? "opacity-100" : "opacity-0",
                    )}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
