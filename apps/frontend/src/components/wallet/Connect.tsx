import { MouseEventHandler } from "react";
import { IconName, Icon } from "@interchain-ui/react";
import { Button as UIButton } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useSidebar } from "../ui/sidebar";
export type ButtonProps = {
  text?: string;
  icon?: IconName;
  loading?: boolean;
  disabled?: boolean;
  onClick?: MouseEventHandler<HTMLButtonElement>;
};

export type ConnectProps = Pick<ButtonProps, "text" | "loading" | "onClick">;

function noop() {}

export function Button({
  text,
  icon,
  loading,
  disabled,
  onClick = noop,
}: ButtonProps) {
  const { open } = useSidebar();
  return (
    <UIButton
      onClick={onClick}
      disabled={disabled || loading}
      className="flex items-center  gap-2 h-10"
    >
      {open && !loading ? (
        <Icon name={icon ?? "walletFilled"} />
      ) : (
        <Loader2 className="animate-spin" />
      )}
      {open && (
        <div className="flex items-center">
          {text}
          {loading ? <Loader2 className="animate-spin ml-1" /> : null}
        </div>
      )}
    </UIButton>
  );
}

export const ButtonConnect = ({
  text = "Connect Wallet",
  onClick = noop,
}: ConnectProps) => (
  <Button text={text} icon="walletFilled" onClick={onClick} />
);

export const ButtonConnected = ({
  text = "My Wallet",
  onClick = noop,
}: ConnectProps) => (
  <Button text={text} icon="walletFilled" onClick={onClick} />
);

export const ButtonDisconnected = ({
  text = "Connect Wallet",
  onClick = noop,
}: ConnectProps) => (
  <Button text={text} icon="walletFilled" onClick={onClick} />
);

export const ButtonConnecting = ({
  text = "Connecting ...",
  loading = true,
}: ConnectProps) => <Button text={text} loading={loading} />;

export const ButtonRejected = ({
  text = "Reconnect",
  onClick = noop,
}: ConnectProps) => (
  <Button text={text} icon="walletFilled" onClick={onClick} />
);

export const ButtonError = ({
  text = "Change Wallet",
  onClick = noop,
}: ConnectProps) => (
  <Button text={text} icon="walletFilled" onClick={onClick} />
);

export const ButtonNotExist = ({
  text = "Install Wallet",
  onClick = noop,
}: ConnectProps) => (
  <Button text={text} icon="walletFilled" onClick={onClick} />
);
