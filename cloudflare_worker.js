/**
 * Cloudflare Worker Proxy for Telegram Media
 * Use this to bypass CORS and hide your Bot Token
 */

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const BOT_TOKEN = "8781671772:AAF_ZsA6uCgKOx-xfk5Uf2g0xThA9ypBsbc";
    
    // Example path: /file/botTOKEN/photos/file_0.jpg
    if (url.pathname.startsWith("/file/")) {
      const tgUrl = `https://api.telegram.org${url.pathname}`;
      const response = await fetch(tgUrl);
      
      const newResponse = new Response(response.body, response);
      newResponse.headers.set("Access-Control-Allow-Origin", "*");
      return newResponse;
    }

    // Proxy for sendPhoto/sendVideo
    if (url.pathname.startsWith("/api/upload")) {
       // ... existing Express logic converted to Worker fetch ...
       return new Response("Use the Express server for uploads", { status: 200 });
    }

    return new Response("VibeWall Worker Active", { status: 200 });
  },
};
