import { decode } from "js-base64";
import { getAllCustomPages, getCustomPageByPath } from "../../api/getAllData";

import { revalidate } from "../../utils/loadConfig";
import Custom404 from "../404";
export interface CustomPagesProps {
  html?: string;
}
const CustomPages = (props: CustomPagesProps) => {
  if (!props.html) {
    return <Custom404 name="自定义页面" />;
  }
  return (
    <>
      <div
        dangerouslySetInnerHTML={{
          __html: decode(props.html),
        }}
      ></div>
    </>
  );
};

export default CustomPages;
export async function getStaticPaths() {
  const data = await getAllCustomPages();
  const paths = data.map((p) => ({
    params: {
      path: p.path.substring(1),
    },
  }));
  return {
    paths,
    fallback: "blocking",
  };
}
export async function getStaticProps({
  params,
}: any): Promise<{ props: CustomPagesProps; revalidate?: number }> {
  const data = await getCustomPageByPath(`/${params.path}`);
  let html = data?.html;

  return {
    props: { html },
    ...revalidate,
  };
}
