import { toast } from "sonner"

export default class Notify {
  static async error(message: string | string[]) {
    toast.error(
      typeof message === "object"
        ? message.map((err) => err).join(", ")
        : message
    )
  }
  static async success(message: string) {
    toast.success(message)
  }
}
