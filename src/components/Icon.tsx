import styled from "styled-components";

const icons = {
  dialogWarning: {
    alt: "Yellow warning icon",
    imageSrc: "/images/dialogWarning.png",
  },
  dialogQuestion: {
    alt: "Blue and white question icon",
    imageSrc: "/images/dialogQuestion.png",
  },
  dialogError: {
    alt: "Red error icon",
    imageSrc: "/images/dialogError.png",
  },
  toolbarOpenUrl: {
    alt: "Open URL",
    imageSrc: "/images/Shell32.png",
    spriteCoordinates: new DOMRect(0, 0, 32, 32),
  },
  toolbarHome: {
    alt: "Home",
    imageSrc: "/images/Shell32.png",
    spriteCoordinates: new DOMRect(32, 0, 32, 32),
  },
  toolbarGlobe: {
    alt: "Globe",
    imageSrc: "/images/Shell32.png",
    spriteCoordinates: new DOMRect(64, 0, 32, 32),
  },
  toolbarWebDocument: {
    alt: "Web Document",
    imageSrc: "/images/Shell32.png",
    spriteCoordinates: new DOMRect(96, 0, 32, 32),
  },
  toolbarSendEmail: {
    alt: "Send Email",
    imageSrc: "/images/Shell32.png",
    spriteCoordinates: new DOMRect(128, 0, 32, 32),
  },
  toolbarCopy: {
    alt: "Copy",
    imageSrc: "/images/Shell32.png",
    spriteCoordinates: new DOMRect(160, 0, 32, 32),
  },
  toolbarCut: {
    alt: "Cut",
    imageSrc: "/images/Shell32.png",
    spriteCoordinates: new DOMRect(192, 0, 32, 32),
  },
  toolbarPaste: {
    alt: "Paste",
    imageSrc: "/images/Shell32.png",
    spriteCoordinates: new DOMRect(224, 0, 32, 32),
  },
  toolbarBack: {
    alt: "Back",
    imageSrc: "/images/Shell32.png",
    spriteCoordinates: new DOMRect(256, 0, 32, 32),
  },
  toolbarForward: {
    alt: "Forward",
    imageSrc: "/images/Shell32.png",
    spriteCoordinates: new DOMRect(288, 0, 32, 32),
  },
  toolbarStop: {
    alt: "Stop",
    imageSrc: "/images/Shell32.png",
    spriteCoordinates: new DOMRect(0, 32, 32, 32),
  },
  toolbarRefresh: {
    alt: "Refresh",
    imageSrc: "/images/Shell32.png",
    spriteCoordinates: new DOMRect(32, 32, 32, 32),
  },
  toolbarFavorites: {
    alt: "Favorites",
    imageSrc: "/images/Shell32.png",
    spriteCoordinates: new DOMRect(64, 32, 32, 32),
  },
  toolbarAddToFavorites: {
    alt: "Add to Favorites",
    imageSrc: "/images/Shell32.png",
    spriteCoordinates: new DOMRect(96, 32, 32, 32),
  },
  toolbarPrint: {
    alt: "Print",
    imageSrc: "/images/Shell32.png",
    spriteCoordinates: new DOMRect(128, 32, 32, 32),
  },
  toolbarSearchWeb: {
    alt: "Search theWeb",
    imageSrc: "/images/Shell32.png",
    spriteCoordinates: new DOMRect(160, 32, 32, 32),
  },
  toolbarLinkWeb: {
    alt: "Web Hyperlink",
    imageSrc: "/images/Shell32.png",
    spriteCoordinates: new DOMRect(192, 32, 32, 32),
  },
  toolbarIncreaseFont: {
    alt: "Increase Font",
    imageSrc: "/images/Shell32.png",
    spriteCoordinates: new DOMRect(224, 32, 32, 32),
  },
  toolbarDecreaseFont: {
    alt: "Decrease Font",
    imageSrc: "/images/Shell32.png",
    spriteCoordinates: new DOMRect(256, 32, 32, 32),
  },
  toolbarFilterRows: {
    alt: "Filter Rows",
    imageSrc: "/images/Shell32.png",
    spriteCoordinates: new DOMRect(288, 32, 32, 32),
  },
  toolbarRefreshFollowers: {
    alt: "Refresh Followers",
    imageSrc: "/images/Shell32.png",
    spriteCoordinates: new DOMRect(0, 64, 32, 32),
  },
  toolbarSelectAll: {
    alt: "Select All",
    imageSrc: "/images/Shell32.png",
    spriteCoordinates: new DOMRect(32, 64, 32, 32),
  },
  toolbarFollow: {
    alt: "Follow",
    imageSrc: "/images/Shell32.png",
    spriteCoordinates: new DOMRect(64, 64, 32, 32),
  },
  toolbarUnfollow: {
    alt: "Unfollow",
    imageSrc: "/images/Shell32.png",
    spriteCoordinates: new DOMRect(96, 64, 32, 32),
  },
  toolbarSort: {
    alt: "Sort",
    imageSrc: "/images/Shell32.png",
    spriteCoordinates: new DOMRect(128, 64, 32, 32),
  },
  toolbarGlobeWithWindows: {
    alt: "Globe wit hWindows",
    imageSrc: "/images/Shell32.png",
    spriteCoordinates: new DOMRect(160, 64, 32, 32),
  },
  toolbarExportMastodon: {
    alt: "Export to Mastodon CSV",
    imageSrc: "/images/Shell32.png",
    spriteCoordinates: new DOMRect(192, 64, 32, 32),
  },
  toolbarMastodon: {
    alt: "Mastodon",
    imageSrc: "/images/Shell32.png",
    spriteCoordinates: new DOMRect(224, 64, 32, 32),
  },
  toolbarDownloadFile: {
    alt: "Download File",
    imageSrc: "/images/Shell32.png",
    spriteCoordinates: new DOMRect(256, 64, 32, 32),
  },
  toolbarDownloadTable: {
    alt: "Download Table",
    imageSrc: "/images/Shell32.png",
    spriteCoordinates: new DOMRect(288, 64, 32, 32),
  },
  toolbarSetup: {
    alt: "Setup",
    imageSrc: "/images/Shell32.png",
    spriteCoordinates: new DOMRect(0, 96, 32, 32),
  },
  toolbarProgram: {
    alt: "Program",
    imageSrc: "/images/Shell32.png",
    spriteCoordinates: new DOMRect(32, 96, 32, 32),
  },
  toolbarWindowsFile: {
    alt: "Windows File",
    imageSrc: "/images/Shell32.png",
    spriteCoordinates: new DOMRect(64, 96, 32, 32),
  },
  toolbarSoundFile: {
    alt: "Sound File",
    imageSrc: "/images/Shell32.png",
    spriteCoordinates: new DOMRect(96, 96, 32, 32),
  },
  toolbarTextFile: {
    alt: "Text File",
    imageSrc: "/images/Shell32.png",
    spriteCoordinates: new DOMRect(128, 96, 32, 32),
  },
  toolbarExit: {
    alt: "Exit",
    imageSrc: "/images/Shell32.png",
    spriteCoordinates: new DOMRect(160, 96, 32, 32),
  },
  toolbarSpeaker: {
    alt: "Speaker",
    imageSrc: "/images/Shell32.png",
    spriteCoordinates: new DOMRect(192, 96, 32, 32),
  },
};

const IconImage = styled.img<{ disabled: boolean }>`
  display: block;
  ${({ disabled, theme }) =>
    disabled
      ? `
          filter: url("#toolbar-disabled-icon") drop-shadow(2px 2px 0 ${theme.canvasTextDisabledShadow});
        `
      : ""}
`;

const IconSprite = styled.span<{
  disabled: boolean;
  imageSrc: string;
  rect: DOMRect;
}>`
  display: block;
  background-image: url("${({ imageSrc }) => imageSrc}");
  ${({ rect }) => `
    width: ${rect.width}px;
    height: ${rect.height}px;
    background-position: -${rect.x}px -${rect.y}px;
  `}
  ${({ disabled, theme }) =>
    disabled
      ? `
      filter: url("#toolbar-disabled-icon") drop-shadow(2px 2px 0 ${theme.canvasTextDisabledShadow});
        `
      : ""}
`;

export type IconProps = {
  disabled?: boolean;
  icon: keyof typeof icons;
  size?: "small" | "medium" | "large";
};

export function Icon({
  disabled,
  icon: iconKey,
  size: sizeName = "large",
}: IconProps) {
  const icon = icons[iconKey];
  const size = sizeName === "small" ? 16 : sizeName === "medium" ? 32 : 64;

  if ("spriteCoordinates" in icon) {
    return (
      <IconSprite
        aria-label={icon.alt}
        disabled={disabled ?? false}
        imageSrc={icon.imageSrc}
        rect={icon.spriteCoordinates}
      />
    );
  }

  return (
    <IconImage
      src={icon.imageSrc}
      alt={icon.alt}
      disabled={disabled ?? false}
      width={size}
      height={size}
    />
  );
}
