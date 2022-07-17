// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import { searchArticles } from "../../api/search";

type Data = {
  name: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<any>
) {
  const result = await searchArticles((req.query.value as string) || "");
  res.status(200).json(result);
}
