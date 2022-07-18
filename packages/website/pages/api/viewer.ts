// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import { addViewer } from "../../api/addViewer";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<any>
) {
  const result = await addViewer();
  res.status(200).json(result);
}
