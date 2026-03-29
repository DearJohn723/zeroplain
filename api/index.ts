import { getApp } from '../server';

export default async (req: any, res: any) => {
  const app = await getApp();
  return app(req, res);
};
