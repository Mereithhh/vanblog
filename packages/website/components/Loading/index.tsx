export default function (props: { children: any; loading: boolean }) {
  if (props.loading) {
    return <div className="loader"></div>;
  }
  return props?.children;
}
