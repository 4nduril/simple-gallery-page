import * as easyimage from "easyimage";

export const resizeToHeightAndWriteImageWith =
  ({ info, resize }: Pick<typeof easyimage, "info" | "resize">) =>
  (targetHeight: number) =>
    function resizeToHeightAndWriteImage([srcPath, dstPath]: [string, string]) {
      return info(srcPath)
        .then(convertDimensionsTo(targetHeight))
        .then(({ width, height }) =>
          resize({
            src: srcPath,
            dst: dstPath,
            height,
            width,
          })
        );
    };

export type InfoRecord = ReturnType<typeof easyimage["info"]> extends Promise<
  infer U
>
  ? U
  : never;

export const convertDimensionsTo =
  (toHeight: number) =>
  ({ width, height }: InfoRecord) => ({
    width: Math.round((toHeight * width) / height),
    height: toHeight,
  });
