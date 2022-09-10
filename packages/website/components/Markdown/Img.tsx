import ImageBox from "../ImageBox";

export default function(props: any) {
  return (
    <ImageBox
      alt={props.alt}
      src={(props.src as string) || ""}
      lazyLoad={true}
    />
  );
}
