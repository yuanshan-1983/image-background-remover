export const runtime = "edge";

const MAX_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("image") as File | null;

    if (!file) {
      return Response.json({ error: "请上传图片" }, { status: 400 });
    }

    // 文件大小校验
    if (file.size > MAX_SIZE) {
      return Response.json({ error: "图片不能超过 10MB" }, { status: 400 });
    }

    // 文件格式校验
    if (!ALLOWED_TYPES.includes(file.type)) {
      return Response.json(
        { error: "请上传 JPG / PNG / WEBP 格式" },
        { status: 400 }
      );
    }

    const apiKey = process.env.REMOVE_BG_API_KEY;
    if (!apiKey) {
      return Response.json({ error: "服务配置错误，请联系管理员" }, { status: 500 });
    }

    // 转发给 Remove.bg API
    const body = new FormData();
    body.append("image_file", file);
    body.append("size", "auto");

    let res = await fetch("https://api.remove.bg/v1.0/removebg", {
      method: "POST",
      headers: { "X-Api-Key": apiKey },
      body,
    });

    if (!res.ok) {
      if (res.status === 402) {
        return Response.json({ error: "Remove.bg 当前额度或套餐不支持更高质量输出，请稍后再试" }, { status: 503 });
      }
      if (res.status === 400) {
        return Response.json({ error: "图片格式不支持或已损坏" }, { status: 400 });
      }
      const text = await res.text();
      return Response.json({ error: `处理失败，请重试` }, { status: 500 });
    }

    // 直接把 PNG 流返回给前端
    return new Response(res.body, {
      headers: {
        "Content-Type": "image/png",
        "Content-Disposition": 'attachment; filename="removed-bg.png"',
        "Cache-Control": "no-store",
      },
    });
  } catch {
    return Response.json({ error: "处理失败，请重试" }, { status: 500 });
  }
}
