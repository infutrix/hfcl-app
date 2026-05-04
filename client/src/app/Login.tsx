import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { cn } from "@/lib/utils"
import { LoginFormSchema, type LoginFormInput } from "@/lib/types/auth"
import {
  Mail,
  Lock,
  EyeOff,
  Eye,
  Loader2,
  ShieldCheck,
  BarChart2,
  Activity,
} from "lucide-react"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useLogin } from "@/hooks/use-auth"

export default function Login() {
  const login = useLogin()

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<LoginFormInput>({
    resolver: zodResolver(LoginFormSchema),
    defaultValues: {
      email: "",
      password: "",
      keepSignedIn: true,
      showPassword: false,
    },
  })

  const showPassword = watch("showPassword")

  const onSubmit = (values: LoginFormInput) => {
    login.mutate({ email: values.email, password: values.password })
  }

  return (
    <div className="flex min-h-svh">
      {/* Left Panel */}
      <div className="hidden flex-col justify-between bg-[#1a4dab] p-10 text-white lg:flex lg:w-[46%]">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-white/20 bg-white/15">
            <img src="/hfcl.png" alt="HFCL Logo" width={24} height={24} />
          </div>
          <div>
            <p className="text-sm leading-none font-bold tracking-wide">
              HFCL OTDR
            </p>
            <p className="mt-0.5 text-[10px] tracking-widest text-white/60">
              ADMIN CONSOLE
            </p>
          </div>
        </div>

        <div className="space-y-5">
          <h1 className="max-w-sm text-4xl leading-tight font-bold">
            Centralized control for OFC test operations across plants.
          </h1>
          <p className="max-w-sm text-sm leading-relaxed text-white/70">
            Real-time OTDR monitoring, version-controlled cable profiles, and
            end-to-end QC traceability — built for HFCL manufacturing.
          </p>

          <div className="flex gap-3 pt-2">
            <div className="flex flex-col items-start gap-1 rounded-lg border border-white/20 bg-white/8 px-4 py-3">
              <BarChart2 size={18} className="text-white/80" />
              <span className="text-xs font-semibold">4 Plants</span>
            </div>
            <div className="flex flex-col items-start gap-1 rounded-lg border border-white/20 bg-white/8 px-4 py-3">
              <Activity size={18} className="text-white/80" />
              <span className="text-xs font-semibold">22 Devices</span>
            </div>
          </div>
        </div>

        <p className="text-xs text-white/40">
          © 2026 HFCL Limited · Optical Fiber Cable Division
        </p>
      </div>

      {/* Right Panel */}
      <div className="flex flex-1 flex-col items-center justify-center bg-gray-50 p-6 md:p-10">
        <div className="w-full max-w-md">
          <div className={"flex flex-col gap-8"}>
            <div className="space-y-1">
              <h1 className="text-3xl font-bold tracking-tight text-gray-900">
                Sign in
              </h1>
              <p className="text-sm text-gray-500">
                Use your HFCL corporate credentials to access the console.
              </p>
            </div>

            <form
              className="space-y-5"
              onSubmit={handleSubmit(onSubmit)}
              noValidate
            >
              <div className="space-y-1.5">
                <label
                  htmlFor="email"
                  className="text-[11px] font-semibold tracking-widest text-gray-500 uppercase"
                >
                  Email
                </label>
                <div className="relative">
                  <Mail
                    size={15}
                    className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-400"
                  />
                  <Controller
                    name="email"
                    control={control}
                    render={({ field }) => (
                      <Input
                        id="email"
                        placeholder="you@hfcl.com"
                        className={cn(
                          "h-11 border-gray-200 bg-white pl-9",
                          errors.email && "border-destructive"
                        )}
                        aria-describedby={
                          errors.email ? "email-error" : undefined
                        }
                        {...field}
                      />
                    )}
                  />
                </div>
                {errors.email && (
                  <p id="email-error" className="text-xs text-destructive">
                    {errors.email.message}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label
                    htmlFor="password"
                    className="text-[11px] font-semibold tracking-widest text-gray-500 uppercase"
                  >
                    Password
                  </label>
                  <button
                    type="button"
                    className="text-sm font-semibold text-[#1a4dab] hover:underline"
                  >
                    Forgot?
                  </button>
                </div>
                <div className="relative">
                  <Lock
                    size={15}
                    className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-400"
                  />
                  <Controller
                    name="password"
                    control={control}
                    render={({ field }) => (
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        className={cn(
                          "h-11 border-gray-200 bg-white pr-10 pl-9",
                          errors.password && "border-destructive"
                        )}
                        aria-describedby={
                          errors.password ? "password-error" : undefined
                        }
                        {...field}
                      />
                    )}
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setValue("showPassword", !showPassword, {
                        shouldDirty: false,
                        shouldTouch: false,
                        shouldValidate: false,
                      })
                    }
                    className="absolute top-1/2 right-3 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                  >
                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
                {errors.password && (
                  <p id="password-error" className="text-xs text-destructive">
                    {errors.password.message}
                  </p>
                )}
              </div>

              <div className="flex items-center justify-between">
                <label className="flex cursor-pointer items-center gap-2 select-none">
                  <Controller
                    name="keepSignedIn"
                    control={control}
                    render={({ field }) => (
                      <Checkbox
                        checked={!!field.value}
                        onCheckedChange={(val) => field.onChange(val === true)}
                      />
                    )}
                  />
                  <span className="text-sm text-gray-600">
                    Keep me signed in
                  </span>
                </label>
                <span className="text-xs text-gray-400">v 2.4.1</span>
              </div>

              <Button
                type="submit"
                disabled={login.isPending}
                className="h-11 w-full bg-[#1a4dab] text-sm font-semibold text-white hover:bg-[#1540a0]"
              >
                {login.isPending ? (
                  <>
                    <Loader2 className="size-4 animate-spin" /> Signing in...
                  </>
                ) : (
                  "Sign in to console"
                )}
              </Button>

              <div className="flex items-start gap-2.5 rounded-lg border border-green-200 bg-green-50 px-4 py-3">
                <ShieldCheck
                  size={15}
                  className="mt-0.5 shrink-0 text-green-600"
                />
                <p className="text-xs leading-relaxed text-gray-500">
                  Restricted system. All access is logged and monitored for
                  compliance with HFCL IT security policy.
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
