import type { APIRoute } from 'astro';
import { getHomeData } from '../../lib/home-data';

export const GET: APIRoute = async () => {
  const data = await getHomeData();

  return new Response(JSON.stringify(data), {
    status: 200,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
    },
  });
};
