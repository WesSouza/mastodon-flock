import type { WindowMeta } from "../../stores/WindowStore";
import { InternetNavigator } from "../InternetNavigator";
import { RevokeAccessContent } from "./RevokeAccessContent";

export function RevokeAccess({ windowMeta }: { windowMeta: WindowMeta }) {
  return (
    <InternetNavigator
      defaultUrl={"about:revoke-access"}
      modal
      title="Revoking Access from Twitter and Mastodon"
      windowMeta={windowMeta}
    >
      <RevokeAccessContent />
    </InternetNavigator>
  );
}
