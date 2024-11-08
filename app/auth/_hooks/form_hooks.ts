import { useState } from "react";
import { loginAction } from "@/app/auth/_actions/loginActions";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerAction } from "@/app/auth/_actions/registerAction";
import { redirect } from "next/navigation";

export function useToggleVisibility(
  initialState: boolean = false,
): [boolean, () => void] {
  const [isVisible, setIsVisible] = useState<boolean>(initialState);
  const toggle = () => setIsVisible((prev) => !prev);
  return [isVisible, toggle];
}

const LoginFormSchema = z.object({
  username: z.string(),
  password: z.string(),
});

const RegistrationFormSchema = z.object({
  username: z.string().regex(/^[a-zA-Z0-9_]*$/, {
    message: "使用者名稱只能包含字母、數字和底線",
  }),
  password: z
    .string()
    .min(6, { message: "密碼至少要有6個字元" })
    .max(50, { message: "密碼太長了" })
    .regex(/^[a-zA-Z0-9_]*$/, { message: "密碼只能包含字母、數字和底線" }),
  passwordValidation: z.string(),
});

export function useUserLoginForm() {
  const [loginErrorMessage, setLoginError] = useState<string | null>(null);
  const [isPasswordVisible, togglePasswordVisibility] =
    useToggleVisibility(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isValid },
  } = useForm<z.infer<typeof LoginFormSchema>>({
    resolver: zodResolver(LoginFormSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  // const userLogin = new UserLoginEntity(user.userName, user.password)
  async function onSubmit(values: z.infer<typeof LoginFormSchema>) {
    console.log("User login", values);
    const res = await loginAction({
      userName: values.username,
      password: values.password,
    });

    if (res?.error) {
      setLoginError(res.error);
    }

    if (res?.success) {
      console.log("Login successful");
      location.reload();
    }
  }

  const onLogin = handleSubmit(onSubmit);

  return {
    register,
    onLogin,
    errors,
    isValid,
    isSubmitting,
    isPasswordVisible,
    togglePasswordVisibility,
    loginErrorMessage,
    setLoginError,
  };
}

export function useUserRegistrationForm() {
  const [registrationErrorMessage, setRegistrationError] = useState<
    string | null
  >(null);
  const [isValidationPasswordVisible, toggleValidationPasswordVisibility] =
    useToggleVisibility(false);

  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors, isSubmitting, isValid },
  } = useForm<z.infer<typeof RegistrationFormSchema>>({
    resolver: zodResolver(RegistrationFormSchema),
    defaultValues: {
      username: "",
      password: "",
      passwordValidation: "",
    },
  });

  // const userLogin = new UserLoginEntity(user.userName, user.password)
  async function onSubmit(values: z.infer<typeof RegistrationFormSchema>) {
    console.log("register", values);
    setRegistrationError(null);
    if (values.password !== values.passwordValidation) {
      setRegistrationError("兩次密碼不同");
      return;
    }
    const res: { error: string } | undefined = await registerAction({
      userName: values.username,
      password: values.password,
    });
    if (res === undefined) {
      return;
    }
    if (res?.error) {
      setRegistrationError(res.error);
    }
  }

  const onRegistration = handleSubmit(onSubmit);

  return {
    register,
    onRegistration,
    errors,
    getValues,
    isValid,
    isSubmitting,
    isValidationPasswordVisible,
    toggleValidationPasswordVisibility,
    registrationErrorMessage,
    setRegistrationError,
  };
}
