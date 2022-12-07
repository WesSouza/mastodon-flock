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
    alt: "Globe with opening folder icon",
    imageSrc: "/images/Shell32.png",
    spriteCoordinates: new DOMRect(0, 0, 32, 32),
  },
  toolbarHome: {
    alt: "House icon",
    imageSrc: "/images/Shell32.png",
    spriteCoordinates: new DOMRect(32, 0, 32, 32),
  },
  toolbarGlobe: {
    alt: "Globe icon",
    imageSrc: "/images/Shell32.png",
    spriteCoordinates: new DOMRect(64, 0, 32, 32),
  },
  toolbarWebDocument: {
    alt: "Globe with sheet of paper icon",
    imageSrc: "/images/Shell32.png",
    spriteCoordinates: new DOMRect(96, 0, 32, 32),
  },
  toolbarSendEmail: {
    alt: "Envelope moving right icon",
    imageSrc: "/images/Shell32.png",
    spriteCoordinates: new DOMRect(128, 0, 32, 32),
  },
  toolbarCopy: {
    alt: "Two sheets of paper icon",
    imageSrc: "/images/Shell32.png",
    spriteCoordinates: new DOMRect(160, 0, 32, 32),
  },
  toolbarCut: {
    alt: "Scissors icon",
    imageSrc: "/images/Shell32.png",
    spriteCoordinates: new DOMRect(192, 0, 32, 32),
  },
  toolbarPaste: {
    alt: "Clipboard icon",
    imageSrc: "/images/Shell32.png",
    spriteCoordinates: new DOMRect(224, 0, 32, 32),
  },
  toolbarBack: {
    alt: "Arrow pointing left icon",
    imageSrc: "/images/Shell32.png",
    spriteCoordinates: new DOMRect(256, 0, 32, 32),
  },
  toolbarForward: {
    alt: "Arrow pointing right icon",
    imageSrc: "/images/Shell32.png",
    spriteCoordinates: new DOMRect(288, 0, 32, 32),
  },
  toolbarStop: {
    alt: "Stop icon",
    imageSrc: "/images/Shell32.png",
    spriteCoordinates: new DOMRect(0, 32, 32, 32),
  },
  toolbarRefresh: {
    alt: "Refresh icon",
    imageSrc: "/images/Shell32.png",
    spriteCoordinates: new DOMRect(32, 32, 32, 32),
  },
  toolbarFavorites: {
    alt: "Favorites folder icon",
    imageSrc: "/images/Shell32.png",
    spriteCoordinates: new DOMRect(64, 32, 32, 32),
  },
  toolbarAddToFavorites: {
    alt: "Document, favorites folder and plus icon",
    imageSrc: "/images/Shell32.png",
    spriteCoordinates: new DOMRect(96, 32, 32, 32),
  },
  toolbarPrint: {
    alt: "Printer icon",
    imageSrc: "/images/Shell32.png",
    spriteCoordinates: new DOMRect(128, 32, 32, 32),
  },
  toolbarSearchWeb: {
    alt: "Globe with magnifying glass icon",
    imageSrc: "/images/Shell32.png",
    spriteCoordinates: new DOMRect(160, 32, 32, 32),
  },
  toolbarLinkWeb: {
    alt: "Globe with chain link icon",
    imageSrc: "/images/Shell32.png",
    spriteCoordinates: new DOMRect(192, 32, 32, 32),
  },
  toolbarIncreaseFont: {
    alt: "Letter A with arrow pointing up arrow",
    imageSrc: "/images/Shell32.png",
    spriteCoordinates: new DOMRect(224, 32, 32, 32),
  },
  toolbarDecreaseFont: {
    alt: "Letter A with arrow pointing down arrow",
    imageSrc: "/images/Shell32.png",
    spriteCoordinates: new DOMRect(256, 32, 32, 32),
  },
  toolbarFilterRows: {
    alt: "Filter with data icon",
    imageSrc: "/images/Shell32.png",
    spriteCoordinates: new DOMRect(288, 32, 32, 32),
  },
  toolbarRefreshFollowers: {
    alt: "Two people with green refresh icon pair",
    imageSrc: "/images/Shell32.png",
    spriteCoordinates: new DOMRect(0, 64, 32, 32),
  },
  toolbarSelectAll: {
    alt: "Checkbox icon",
    imageSrc: "/images/Shell32.png",
    spriteCoordinates: new DOMRect(32, 64, 32, 32),
  },
  toolbarFollow: {
    alt: "Two people and a blue check icon",
    imageSrc: "/images/Shell32.png",
    spriteCoordinates: new DOMRect(64, 64, 32, 32),
  },
  toolbarUnfollow: {
    alt: "Two people and a red cross icon",
    imageSrc: "/images/Shell32.png",
    spriteCoordinates: new DOMRect(96, 64, 32, 32),
  },
  toolbarSort: {
    alt: "Sort icon",
    imageSrc: "/images/Shell32.png",
    spriteCoordinates: new DOMRect(128, 64, 32, 32),
  },
  toolbarGlobeWithWindows: {
    alt: "Globe with Windows",
    imageSrc: "/images/Shell32.png",
    spriteCoordinates: new DOMRect(160, 64, 32, 32),
  },
  toolbarExportMastodon: {
    alt: "Table with arrow pointing at Mastodon icon",
    imageSrc: "/images/Shell32.png",
    spriteCoordinates: new DOMRect(192, 64, 32, 32),
  },
  toolbarMastodon: {
    alt: "Mastodon icon",
    imageSrc: "/images/Shell32.png",
    spriteCoordinates: new DOMRect(224, 64, 32, 32),
  },
  toolbarDownloadFile: {
    alt: "Paper with arrow pointing down icon",
    imageSrc: "/images/Shell32.png",
    spriteCoordinates: new DOMRect(256, 64, 32, 32),
  },
  toolbarDownloadTable: {
    alt: "Table with arrow pointing down icon",
    imageSrc: "/images/Shell32.png",
    spriteCoordinates: new DOMRect(288, 64, 32, 32),
  },
  toolbarSetup: {
    alt: "Setup icon",
    imageSrc: "/images/Shell32.png",
    spriteCoordinates: new DOMRect(0, 96, 32, 32),
  },
  toolbarProgram: {
    alt: "Program icon",
    imageSrc: "/images/Shell32.png",
    spriteCoordinates: new DOMRect(32, 96, 32, 32),
  },
  toolbarWindowsFile: {
    alt: "Windows file icon",
    imageSrc: "/images/Shell32.png",
    spriteCoordinates: new DOMRect(64, 96, 32, 32),
  },
  toolbarSoundFile: {
    alt: "Sound file icon",
    imageSrc: "/images/Shell32.png",
    spriteCoordinates: new DOMRect(96, 96, 32, 32),
  },
  toolbarTextFile: {
    alt: "Text file icon",
    imageSrc: "/images/Shell32.png",
    spriteCoordinates: new DOMRect(128, 96, 32, 32),
  },
  toolbarExit: {
    alt: "Open door with arrow pointing inside it icon",
    imageSrc: "/images/Shell32.png",
    spriteCoordinates: new DOMRect(160, 96, 32, 32),
  },
  toolbarSpeaker: {
    alt: "Speaker icon",
    imageSrc: "/images/Shell32.png",
    spriteCoordinates: new DOMRect(192, 96, 32, 32),
  },
  toolbarHelp: {
    alt: "Yellow question mark icon",
    imageSrc: "/images/Shell32.png",
    spriteCoordinates: new DOMRect(224, 96, 32, 32),
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
  title?: string;
};

export function Icon({
  disabled,
  icon: iconKey,
  size: sizeName = "large",
  title,
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
        title={title}
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
      title={title}
    />
  );
}
