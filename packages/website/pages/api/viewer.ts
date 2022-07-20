// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import { addViewer } from "../../api/addViewer";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<any>
) {
  // let ip = "";
  // let forwarded = req.headers["x-forwarded-for"];
  // if (forwarded instanceof Array) {
  //   forwarded = forwarded[0];
  // }
  // if (forwarded && forwarded != "") {
  //   ip = (forwarded as string)?.split(/, /)[0];
  // } else {
  //   ip = req.connection.remoteAddress || "";
  // }
  const result = await addViewer();
  res.status(200).json(result);
}
