import ImageBox from "../ImageBox";

const mapProps = (source: any) => {
  const res: any = {};
  for (const [k, v] of Object.entries(source)) {
    switch (k) {
      case "width":
        res["width"] = v;
        break;
      case "heigth":
        res["heigth"] = v;
        break;
      case "class":
        res["className"] = v;
        break;
      case "className":
        res["className"] = v;
        break;
    }
  }
  return res;
};

export default function (props: any) {
  const { node } = props;
  const { properties } = node || {};
  return (
    <ImageBox
      alt={props.alt}
      src={(props.src as string) || ""}
      lazyLoad={true}
      {...mapProps(properties)}
    />
  );
}
