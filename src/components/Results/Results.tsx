import { Button, Window, WindowContent, WindowHeader } from "react95";

export function Results() {
  return (
    <Window>
      <WindowHeader>
        <span>Mastodon Flock</span>
        <Button>&times;</Button>
      </WindowHeader>
      <WindowContent>Results</WindowContent>
    </Window>
  );
}
