import React from "react";
import { Still } from "remotion";
import { ModelSheet } from "./brain/sheets/ModelSheet";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Still id="ModelSheet" component={ModelSheet} width={1080} height={1920} />
    </>
  );
};
