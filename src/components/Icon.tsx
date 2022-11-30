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
};

const IconImage = styled.img``;

export function Icon({
  icon: iconKey,
  size: sizeName = "large",
}: { icon: keyof typeof icons; size?: "small" | "medium" | "large" }) {
  const icon = icons[iconKey];
  const size = sizeName === "small" ? 16 : sizeName === "medium" ? 32 : 64;
  return (
    <IconImage src={icon.imageSrc} alt={icon.alt} width={size} height={size} />
  );
}
