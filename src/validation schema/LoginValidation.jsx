import * as Yup from "yup";

export const LoginFormSchema = Yup.object().shape({
    email:Yup.string().required("Please enter your Username.").min(5, "Username is too short!").max(35,"Username is too long!"),
    password:Yup.string().required("Please enter your password.").min(5, "Password is too short!").max(20,"Password is too long!"),
})