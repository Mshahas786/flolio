import { NextResponse } from "next/server"
import { cloudinary } from "@/lib/cloudinary"

export async function POST(req: Request) {
  const form = await req.formData()
  const file = form.get("file") as File | null
  if (!file) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 })
  }

  const buffer = Buffer.from(await file.arrayBuffer())

  try {
    const result = await new Promise<any>((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          { resource_type: "image", folder: "flolio" },
          (error, result) => {
            if (error || !result) reject(error)
            else resolve(result)
          },
        )
        .end(buffer)
    })

    return NextResponse.json({ url: result.secure_url })
  } catch {
    return NextResponse.json({ error: "Upload failed" }, { status: 500 })
  }
}
