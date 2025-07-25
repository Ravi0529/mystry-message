import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/options";
import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";
import { User } from "next-auth";
import { NextRequest } from "next/server";

export const DELETE = async (req: NextRequest) => {
  const messageId = req.nextUrl.pathname.split("/").pop();
  await dbConnect();

  const session = await getServerSession(authOptions);
  const user: User = session?.user as User;

  if (!session || !session.user) {
    return Response.json(
      {
        success: false,
        message: "Not Authenticated",
      },
      {
        status: 401,
      }
    );
  }

  try {
    const updateResult = await UserModel.updateOne(
      { _id: user._id },
      { $pull: { messages: { _id: messageId } } }
    );

    if (updateResult.modifiedCount == 0) {
      return Response.json(
        {
          success: false,
          message: "Message not found or already deleted",
        },
        {
          status: 404,
        }
      );
    }

    return Response.json(
      {
        success: true,
        message: "Message Deleted.",
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error in delete message route: ", error);
    return Response.json(
      {
        success: false,
        message: "Error deleting message.",
      },
      {
        status: 500,
      }
    );
  }
};
