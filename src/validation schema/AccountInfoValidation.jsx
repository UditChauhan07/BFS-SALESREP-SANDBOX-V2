import * as Yup from "yup";

export const AccountInfoValidation = Yup.object().shape({
    brand:Yup.object().required("Please select Brand name."),
    description :Yup.string().required("Please enter description.").min(1, "Use 1 characters or more for description."),  
})

export const UpdateInfoWithStoreValidation = Yup.object().shape({
    account:Yup.object().required("Please select Store name."),
    brand:Yup.object().required("Please select Brand name."),
    description :Yup.string().required("Please enter description.").min(1, "Use 1 characters or more for description."),  
})