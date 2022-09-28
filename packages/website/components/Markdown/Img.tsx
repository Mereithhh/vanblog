import ImageBox from "../ImageBox";

export default function (props: any) {
  const { node } = props;
  const { properties } = node || {};
  return (
    <ImageBox
      alt={props.alt}
      src={(props.src as string) || ""}
      lazyLoad={true}
      {...properties}
    />
  );
}
