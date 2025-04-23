
import axios from "axios";
import { NextRequest, NextResponse } from "next/server";

export const revalidate = 30
export async function POST(request: NextRequest) {
  try {
    const data = (await request.json());
    const token = data.authtoken;
    const endpoint = data.endpoint;
    const uuid = data.uuid;

    if (token === undefined || token == '') {
      return NextResponse.json("authtoken is undefined");
    }

    const response: any = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/volume-bot/${endpoint}`,
      {
        uuid
      },
      {
        headers: {
          authorization: process.env.NEXT_PUBLIC_API_KEY,
          authtoken: token
        }
      }
    );

    return NextResponse.json(response.data);
  } catch (e: any) {
    if (e.response.data.errors[0].msg) {
      return NextResponse.json(e.response.data.errors[0].msg);
    }

    return NextResponse.json("An error ocurred");
  }
}

