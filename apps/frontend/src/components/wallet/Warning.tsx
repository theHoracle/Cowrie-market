import { Icon, IconName } from "@interchain-ui/react";

export type WarningProps = {
  text: string;
  icon?: IconName;
};

export function Warning({ text, icon }: WarningProps) {
  return (
    <div className="text-xs flex flex-start">
      <Icon name={icon ?? "errorWarningLine"} size="$lg" />
      <p className="">{text}</p>
    </div>
  );
}
