import { Button, Frame } from "react95";

export function LoadingInformation({ cancel }: { cancel: () => void }) {
  return (
    <Frame>
      <Button onClick={cancel}>Cancel</Button>
    </Frame>
  );
}
